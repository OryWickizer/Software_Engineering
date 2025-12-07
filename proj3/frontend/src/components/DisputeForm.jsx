/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'react-toastify';

const DISPUTE_REASONS = {
  wrong_meal: "Received Wrong Meal",
  missing_items: "Missing Items",
  poor_quality: "Poor Quality",
  food_safety: "Food Safety Concern",
  not_as_described: "Not As Described",
  seller_no_show: "Seller No Show",
  other: "Other"
};

export default function DisputeForm({ transaction, meal, isOpen, onClose, onDisputeFiled }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason for the dispute');
      return;
    }

    if (!description || description.length < 10) {
      toast.error('Please provide a detailed description (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const userEmail = localStorage.getItem('email');
      const response = await fetch('http://localhost:8000/api/disputes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userEmail}`
        },
        body: JSON.stringify({
          transaction_id: transaction.id || `trans_${Date.now()}`, // Generate temp ID if not available
          meal_id: meal.id,
          seller_id: meal.seller_id,
          reason: reason,
          description: description,
          photos: []
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to file dispute');
      }

      const dispute = await response.json();
      toast.success('Dispute filed successfully! Our team will review it within 24-48 hours.');
      
      if (onDisputeFiled) {
        onDisputeFiled(dispute);
      }
      
      // Reset form
      setReason('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error filing dispute:', error);
      toast.error(error.message || 'Failed to file dispute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>File a Dispute</DialogTitle>
          <DialogDescription>
            Report an issue with your purchase and request a refund
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-2">
          <div>
            <Label className="font-semibold">Meal</Label>
            <p className="text-sm text-muted-foreground">{meal?.title || meal?.name}</p>
          </div>

          <div>
            <Label className="font-semibold">Seller</Label>
            <p className="text-sm text-muted-foreground">{meal?.seller_name || meal?.cookName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Dispute *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DISPUTE_REASONS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about what went wrong..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters ({description.length}/10)
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Our support team will review your dispute within 24-48 hours. 
              If approved, a refund will be issued to your original payment method.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason || description.length < 10}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? 'Filing Dispute...' : 'File Dispute'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
