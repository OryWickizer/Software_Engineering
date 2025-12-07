import { useEffect, useState } from 'react';
import { listEvents, listMyEvents, createEvent, joinEvent, addDish } from '../services/EventService';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'react-toastify';

export default function EventsTab({ currentUser, authToken }) {
  const [events, setEvents] = useState([]);
  const [creating, setCreating] = useState(false);
  const [showMine, setShowMine] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', neighborhood: '', date: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dishTitle, setDishTitle] = useState('');
  const [dishDescription, setDishDescription] = useState('');

  const load = async (mine = false) => {
    try {
      let data;
      if (mine) {
        if (!authToken) {
          toast.info('Log in to see your events');
          data = [];
        } else {
          data = await listMyEvents(authToken);
        }
      } else {
        data = await listEvents();
      }
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events', err);
      toast.error('Failed to load events');
    }
  };

  useEffect(() => { load(showMine); }, [showMine]);

  const handleCreate = async () => {
    if (!form.title || !form.date) {
      toast.error('Please provide at least a title and date');
      return;
    }
    try {
      // convert date to ISO
      const payload = { ...form, date: new Date(form.date).toISOString() };
      await createEvent(payload, authToken);
      setCreating(false);
      setForm({ title: '', description: '', neighborhood: '', date: '' });
      await load();
      toast.success('Event created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create event');
    }
  };

  const handleJoin = async (eventId) => {
    try {
      await joinEvent(eventId, authToken);
      await load();
      toast.success('Joined event');
    } catch (err) {
      console.error(err);
      toast.error('Failed to join');
    }
  };

  const handleAddDish = async (eventId) => {
    if (!dishTitle) {
      toast.error('Please add a dish title');
      return;
    }
    try {
      await addDish(eventId, { title: dishTitle, description: dishDescription }, authToken);
      setDishTitle('');
      setDishDescription('');
      await load();
      toast.success('Dish added');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add dish');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl">Neighborhood & Seasonal Events</h2>
          <div className="flex items-center space-x-2">
            <Button variant={showMine ? 'ghost' : 'default'} onClick={() => setShowMine(false)}>All Events</Button>
            <Button variant={showMine ? 'default' : 'ghost'} onClick={() => setShowMine(true)}>My Events</Button>
          </div>
        </div>
        <Button onClick={() => setCreating(true)}>Create Event</Button>
      </div>

      <div className="grid gap-4">
        {events.map(ev => (
          <Card key={ev.id} className="p-4">
            <CardHeader>
              <CardTitle>{ev.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{new Date(ev.date).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{ev.organizer_name ? `Created by ${ev.organizer_name}` : ''}</div>
              <div className="mt-2">{ev.description}</div>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => setSelectedEvent(ev)}>View</Button>
                {(() => {
                  const joined = (ev.attendees || []).some(a => (a.id || a) === (currentUser?.id || currentUser?._id));
                  return joined ? (
                    <Button disabled>Joined</Button>
                  ) : (
                    <Button onClick={() => handleJoin(ev.id)}>Join</Button>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {creating && (
        <Dialog open={creating} onOpenChange={(v) => setCreating(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <Label>Date & Time</Label>
                <input type="datetime-local" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <Label>Neighborhood</Label>
                <input value={form.neighborhood} onChange={(e) => setForm({...form, neighborhood: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button onClick={() => setCreating(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(v) => { if (!v) setSelectedEvent(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">{new Date(selectedEvent.date).toLocaleString()}</div>
              <div>{selectedEvent.description}</div>
              <div className="mt-2">
                <div className="font-medium">Attendees</div>
                <ul className="list-disc ml-5">
                  {selectedEvent.attendees?.map((a) => (
                    <li key={a?.id || a}>{a?.name || a?.id || a}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <div className="font-medium">Dishes</div>
                <ul className="list-disc ml-5">
                  {selectedEvent.dishes?.map((d) => (
                    <li key={d?.id || d?.title}>{d.title}{d.seller_name ? ` (by ${d.seller_name})` : ''}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3">
                <Label>Offer a Dish</Label>
                <input value={dishTitle} onChange={(e) => setDishTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="Dish title" />
                <Textarea value={dishDescription} onChange={(e) => setDishDescription(e.target.value)} placeholder="Optional details" />
                <div className="flex justify-end gap-2 mt-2">
                  <Button onClick={() => handleAddDish(selectedEvent.id)}>Add Dish</Button>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={() => setSelectedEvent(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
