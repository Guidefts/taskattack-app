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
      tasks: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          completed: boolean
          completed_at: string | null
          featured: boolean
          group: string | null
          date: string
          user_id: string
          order: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          completed?: boolean
          completed_at?: string | null
          featured?: boolean
          group?: string | null
          date: string
          user_id: string
          order?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          completed?: boolean
          completed_at?: string | null
          featured?: boolean
          group?: string | null
          date?: string
          user_id?: string
          order?: number | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string
          avatar_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}