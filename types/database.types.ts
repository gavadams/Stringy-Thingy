export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'customer' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'customer' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'customer' | 'admin'
          created_at?: string
        }
        Relationships: []
      }
      kit_codes: {
        Row: {
          id: string
          code: string
          kit_type: 'starter' | 'standard' | 'premium'
          max_generations: number
          used_count: number
          is_active: boolean
          purchase_date: string | null
          redeemed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          kit_type: 'starter' | 'standard' | 'premium'
          max_generations?: number
          used_count?: number
          is_active?: boolean
          purchase_date?: string | null
          redeemed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          kit_type?: 'starter' | 'standard' | 'premium'
          max_generations?: number
          used_count?: number
          is_active?: boolean
          purchase_date?: string | null
          redeemed_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_codes_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      generations: {
        Row: {
          id: string
          user_id: string
          kit_code_id: string
          image_url: string | null
          settings: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          kit_code_id: string
          image_url?: string | null
          settings: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          kit_code_id?: string
          image_url?: string | null
          settings?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_kit_code_id_fkey"
            columns: ["kit_code_id"]
            isOneToOne: false
            referencedRelation: "kit_codes"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          kit_type: string
          pegs: number
          lines: number
          frame_size: string
          images: string[]
          is_active: boolean
          stock: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          kit_type: string
          pegs: number
          lines: number
          frame_size: string
          images?: string[]
          is_active?: boolean
          stock?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          kit_type?: string
          pegs?: number
          lines?: number
          frame_size?: string
          images?: string[]
          is_active?: boolean
          stock?: number
          created_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          email: string
          stripe_id: string
          product_id: string
          quantity: number
          total: number
          status: 'pending' | 'paid' | 'shipped' | 'completed'
          kit_codes: string[]
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          stripe_id: string
          product_id: string
          quantity: number
          total: number
          status?: 'pending' | 'paid' | 'shipped' | 'completed'
          kit_codes?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          stripe_id?: string
          product_id?: string
          quantity?: number
          total?: number
          status?: 'pending' | 'paid' | 'shipped' | 'completed'
          kit_codes?: string[]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      content: {
        Row: {
          id: string
          key: string
          content: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          content: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          content?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_kit_usage: {
        Args: {
          code_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
