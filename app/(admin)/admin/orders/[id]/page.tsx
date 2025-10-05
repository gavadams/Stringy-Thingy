"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Mail,
  Package,
  DollarSign,
  User,
  MapPin,
  CreditCard,
  Copy,
  RefreshCw,
  Send
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Database } from "@/types/database.types";

type Order = Database['public']['Tables']['orders']['Row'] & {
  notes?: Array<{
    text: string;
    added_at: string;
    added_by?: string;
  }>;
  customer_name?: string;
  phone?: string;
  shipping_address?: any;
  billing_address?: any;
  order_items?: Array<{
    id: string;
    name: string;
    kit_type: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      setOrder(data);
    } catch (err) {
      setError('Failed to fetch order');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  const updateOrderStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        toast.error('Failed to update status');
        return;
      }

      setOrder(prev => prev ? { ...prev, status: newStatus as Order['status'] } : null);
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const supabase = createClient();
      
      const currentNotes = order?.notes || [];
      const newNoteObj = {
        text: newNote.trim(),
        added_at: new Date().toISOString(),
        added_by: 'admin'
      };

      const { error } = await supabase
        .from('orders')
        .update({ 
          notes: [...currentNotes, newNoteObj]
        })
        .eq('id', orderId);

      if (error) {
        toast.error('Failed to add note');
        return;
      }

      setOrder(prev => prev ? { 
        ...prev, 
        notes: [...currentNotes, newNoteObj] 
      } : null);
      
      setNewNote('');
      toast.success('Note added');
    } catch {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'shipped':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Shipped</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            {error || 'Order not found'}
          </div>
          <Button asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              {new Date(order.created_at).toLocaleDateString()} • {order.email}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(order.status)}
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Resend Email
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg">{order.email}</p>
              </div>
              
              {order.customer_name && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer Name</label>
                  <p className="text-lg">{order.customer_name}</p>
                </div>
              )}
              
              {order.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-lg">{order.phone}</p>
                </div>
              )}
              
              {order.shipping_address && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Shipping Address</label>
                  <div className="flex items-start mt-1">
                    <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-400" />
                    <div>
                      <p>{order.shipping_address.line1}</p>
                      {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                      <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {order.billing_address && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Billing Address</label>
                  <div className="flex items-start mt-1">
                    <CreditCard className="w-4 h-4 mr-2 mt-1 text-gray-400" />
                    <div>
                      <p>{order.billing_address.line1}</p>
                      {order.billing_address.line2 && <p>{order.billing_address.line2}</p>}
                      <p>{order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}</p>
                      <p>{order.billing_address.country}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Products Ordered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.products?.map((product: { name: string; kit_type: string; quantity: number; price: number }, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        {product.kit_type} • Qty: {product.quantity}
                      </div>
                    </div>
                    <div className="font-semibold">
                      ${(product.price * product.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kit Codes */}
          {order.kit_codes && order.kit_codes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Kit Codes ({order.kit_codes.length})
                  </span>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.kit_codes.map((code: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="font-mono font-semibold">{code}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.notes && order.notes.length > 0 ? (
                <div className="space-y-3">
                  {order.notes.map((note: { text: string; added_at: string; added_by: string }, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        {new Date(note.added_at).toLocaleString()} by {note.added_by}
                      </div>
                      <div>{note.text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No notes added yet.</p>
              )}
              
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={addNote}
                  disabled={addingNote || !newNote.trim()}
                >
                  {addingNote ? 'Adding...' : 'Add Note'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button
                  variant={order.status === 'paid' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => updateOrderStatus('paid')}
                  disabled={updatingStatus}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Paid
                </Button>
                <Button
                  variant={order.status === 'shipped' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => updateOrderStatus('shipped')}
                  disabled={updatingStatus}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Shipped
                </Button>
                <Button
                  variant={order.status === 'completed' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => updateOrderStatus('completed')}
                  disabled={updatingStatus}
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Completed
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Stripe Session ID</label>
                <p className="font-mono text-sm">{order.stripe_session_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Intent</label>
                <p className="font-mono text-sm">{order.stripe_payment_intent_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Amount</label>
                <p className="text-lg font-semibold">${order.total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Send Shipping Email
              </Button>
              <Button className="w-full" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Resend Confirmation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
