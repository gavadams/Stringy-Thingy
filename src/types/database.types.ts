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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_kit_code_id_fkey"
            columns: ["kit_code_id"]
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
