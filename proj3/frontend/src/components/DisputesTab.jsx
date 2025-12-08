 
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  refunded: 'bg-emerald-100 text-emerald-800'
};

const STATUS_ICONS = {
  pending: Clock,
  under_review: AlertCircle,
  resolved: CheckCircle,
  rejected: XCircle,
  refunded: DollarSign
};

const REASON_LABELS = {
  wrong_meal: "Wrong Meal Received",
  missing_items: "Missing Items",
  poor_quality: "Poor Quality",
  food_safety: "Food Safety Concern",
  not_as_described: "Not As Described",
  seller_no_show: "Seller No Show",
  other: "Other"
};

export default function DisputesTab() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    setError(null);

    try {
      const userEmail = localStorage.getItem('email');
      const response = await fetch('http://localhost:8000/api/disputes/my-disputes', {
        headers: {
          'Authorization': `Bearer ${userEmail}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      }

      const data = await response.json();
      setDisputes(data);
    } catch (err) {
      console.error('Error fetching disputes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p>Loading your disputes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Error loading disputes: {error}</p>
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
        <h3 className="text-xl font-semibold">No Disputes Filed</h3>
        <p className="text-muted-foreground">
          You haven't filed any disputes. We hope all your purchases have been satisfactory!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">My Disputes</h2>
        <p className="text-muted-foreground">
          Track the status of your filed disputes and refund requests
        </p>
      </div>

      {disputes.map((dispute) => {
        const StatusIcon = STATUS_ICONS[dispute.status] || AlertCircle;
        
        return (
          <Card key={dispute.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{dispute.meal_title}</CardTitle>
                  <CardDescription className="mt-1">
                    Seller: {dispute.seller_name}
                  </CardDescription>
                </div>
                <Badge className={STATUS_COLORS[dispute.status]}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {dispute.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Reason</p>
                <p className="text-sm">{REASON_LABELS[dispute.reason] || dispute.reason}</p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Description</p>
                <p className="text-sm">{dispute.description}</p>
              </div>

              {dispute.admin_notes && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm font-semibold text-blue-800">Admin Response</p>
                  <p className="text-sm text-blue-700">{dispute.admin_notes}</p>
                </div>
              )}

              {dispute.refund_amount && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm font-semibold text-green-800">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Refund Amount: ${dispute.refund_amount.toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>Filed: {formatDate(dispute.created_at)}</span>
                {dispute.resolved_at && (
                  <span>Resolved: {formatDate(dispute.resolved_at)}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
