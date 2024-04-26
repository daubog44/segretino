export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          chat_name: string | null
          chatRoomType: Database["public"]["Enums"]["chatRoomType"]
          created_at: string
          id: string
          image_ref: string | null
          isEffimer: boolean
          isGroup: boolean
        }
        Insert: {
          chat_name?: string | null
          chatRoomType?: Database["public"]["Enums"]["chatRoomType"]
          created_at?: string
          id?: string
          image_ref?: string | null
          isEffimer?: boolean
          isGroup?: boolean
        }
        Update: {
          chat_name?: string | null
          chatRoomType?: Database["public"]["Enums"]["chatRoomType"]
          created_at?: string
          id?: string
          image_ref?: string | null
          isEffimer?: boolean
          isGroup?: boolean
        }
        Relationships: []
      }
      encrypted_messages: {
        Row: {
          encrypted_message: string
          id: number
          message_ref: string
          recipient_id: string
          viewd: boolean
        }
        Insert: {
          encrypted_message: string
          id?: number
          message_ref: string
          recipient_id: string
          viewd?: boolean
        }
        Update: {
          encrypted_message?: string
          id?: number
          message_ref?: string
          recipient_id?: string
          viewd?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "public_encrypted_messages_message_ref_fkey"
            columns: ["message_ref"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_encrypted_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "partecipantsChatRoom"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          by: string
          chat: string
          created_at: string
          deleted: boolean
          id: string
          messageType: Database["public"]["Enums"]["messageType"]
          updatedAt: string | null
        }
        Insert: {
          by: string
          chat: string
          created_at?: string
          deleted?: boolean
          id?: string
          messageType?: Database["public"]["Enums"]["messageType"]
          updatedAt?: string | null
        }
        Update: {
          by?: string
          chat?: string
          created_at?: string
          deleted?: boolean
          id?: string
          messageType?: Database["public"]["Enums"]["messageType"]
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_messages_by_fkey"
            columns: ["by"]
            isOneToOne: false
            referencedRelation: "partecipantsChatRoom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_messages_chat_fkey"
            columns: ["chat"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      partecipants_chats: {
        Row: {
          chat_id: string
          hasLeaved: boolean
          id: string
          isStarred: boolean
          isTyping: boolean
          partecipant_id: string
          role: Database["public"]["Enums"]["chatUserRole"]
        }
        Insert: {
          chat_id: string
          hasLeaved?: boolean
          id?: string
          isStarred?: boolean
          isTyping?: boolean
          partecipant_id: string
          role?: Database["public"]["Enums"]["chatUserRole"]
        }
        Update: {
          chat_id?: string
          hasLeaved?: boolean
          id?: string
          isStarred?: boolean
          isTyping?: boolean
          partecipant_id?: string
          role?: Database["public"]["Enums"]["chatUserRole"]
        }
        Relationships: [
          {
            foreignKeyName: "public_partecipants_chats_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_partecipants_chats_partecipant_id_fkey"
            columns: ["partecipant_id"]
            isOneToOne: false
            referencedRelation: "partecipantsChatRoom"
            referencedColumns: ["id"]
          },
        ]
      }
      partecipantsChatRoom: {
        Row: {
          id: string
          isOnline: boolean | null
          online_at: string | null
          private_key: string | null
          public_key: string | null
          userId: string
        }
        Insert: {
          id?: string
          isOnline?: boolean | null
          online_at?: string | null
          private_key?: string | null
          public_key?: string | null
          userId: string
        }
        Update: {
          id?: string
          isOnline?: boolean | null
          online_at?: string | null
          private_key?: string | null
          public_key?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_partecipantChatRoom_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_encrypted_message: {
        Args: {
          recipient_id: string
          message: string
          message_ref: string
        }
        Returns: string
      }
      selcet_pa_pub_key: {
        Args: {
          pa_id: string
        }
        Returns: string
      }
    }
    Enums: {
      chatRoomType: "public" | "private"
      chatUserRole: "admin" | "base" | "viewer"
      messageType: "text" | "file" | "position" | "image" | "contact" | "video"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
