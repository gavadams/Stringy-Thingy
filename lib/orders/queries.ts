import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type Order = Database['public']['Tables']['orders']['Row'];

export interface OrderWithDetails extends Order {
  products: Array<{
    id: string;
    name: string;
    kit_type: string;
    quantity: number;
    price: number;
  }>;
  kit_codes: string[];
}

export async function getAllOrders(): Promise<{ data: OrderWithDetails[] | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return { data: null, error: error.message };
    }

    return { data: data as OrderWithDetails[], error: null };
  } catch (error) {
    console.error('Exception fetching orders:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch orders' 
    };
  }
}

export async function getOrderById(id: string): Promise<{ data: OrderWithDetails | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return { data: null, error: error.message };
    }

    return { data: data as OrderWithDetails, error: null };
  } catch (error) {
    console.error('Exception fetching order:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch order' 
    };
  }
}

export async function getOrderBySessionId(sessionId: string): Promise<{ data: OrderWithDetails | null; error: string | null }> {
  try {
    console.log('Querying orders for sessionId:', sessionId);
    const supabase = createClient();
    
    // Query without .single() to avoid error when no results found
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId);

    console.log('Supabase query result:', { ordersCount: orders?.length, error });

    if (error) {
      console.error('Error fetching order by session ID:', error);
      return { data: null, error: error.message };
    }

    // Handle no results
    if (!orders || orders.length === 0) {
      console.log('No orders found for sessionId:', sessionId);
      return { data: null, error: null };
    }

    // Handle multiple results (shouldn't happen, but be safe)
    if (orders.length > 1) {
      console.warn(`Multiple orders found for session ${sessionId}, returning most recent`);
      const sortedOrders = orders.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return { data: sortedOrders[0] as OrderWithDetails, error: null };
    }

    // Return single order
    return { data: orders[0] as OrderWithDetails, error: null };

  } catch (error) {
    console.error('Exception fetching order by session ID:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch order' 
    };
  }
}

export async function getOrdersByEmail(email: string): Promise<{ data: OrderWithDetails[] | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders by email:', error);
      return { data: null, error: error.message };
    }

    return { data: data as OrderWithDetails[], error: null };
  } catch (error) {
    console.error('Exception fetching orders by email:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch orders' 
    };
  }
}

export async function getOrdersByStatus(status: string): Promise<{ data: OrderWithDetails[] | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders by status:', error);
      return { data: null, error: error.message };
    }

    return { data: data as OrderWithDetails[], error: null };
  } catch (error) {
    console.error('Exception fetching orders by status:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch orders' 
    };
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Exception updating order status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update order status' 
    };
  }
}

export async function addOrderNote(id: string, note: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createClient();
    
    // Get current notes
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('notes')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching order for notes:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentNotes = order.notes || [];
    const newNote = {
      text: note,
      added_at: new Date().toISOString(),
      added_by: 'admin' // In a real app, this would be the current user
    };

    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        notes: [...currentNotes, newNote]
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error adding order note:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Exception adding order note:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add order note' 
    };
  }
}