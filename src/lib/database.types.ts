export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      farmers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["farmers"]["Insert"]>;
        Relationships: [];
      };
      farms: {
        Row: {
          id: string;
          farmer_id: string;
          farm_name: string;
          village: string | null;
          district: string | null;
          state: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          farmer_id: string;
          farm_name: string;
          village?: string | null;
          district?: string | null;
          state?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["farms"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "farms_farmer_id_fkey";
            columns: ["farmer_id"];
            isOneToOne: false;
            referencedRelation: "farmers";
            referencedColumns: ["id"];
          },
        ];
      };
      batches: {
        Row: {
          id: string;
          batch_code: string;
          farm_id: string;
          crop_name: string;
          variety: string | null;
          sowing_date: string;
          expected_harvest_date: string | null;
          harvest_date: string | null;
          quantity: number;
          unit: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_code: string;
          farm_id: string;
          crop_name: string;
          variety?: string | null;
          sowing_date: string;
          expected_harvest_date?: string | null;
          harvest_date?: string | null;
          quantity: number;
          unit: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["batches"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "batches_farm_id_fkey";
            columns: ["farm_id"];
            isOneToOne: false;
            referencedRelation: "farms";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          batch_id: string;
          activity_type: string;
          description: string | null;
          activity_date: string;
          latitude: number | null;
          longitude: number | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          activity_type: string;
          description?: string | null;
          activity_date: string;
          latitude?: number | null;
          longitude?: number | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "activities_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "batches";
            referencedColumns: ["id"];
          },
        ];
      };
      verifications: {
        Row: {
          id: string;
          batch_id: string;
          verified_by: string | null;
          organization: string | null;
          status: "UNVERIFIED" | "PENDING" | "VERIFIED";
          remarks: string | null;
          verified_at: string | null;
        };
        Insert: {
          id?: string;
          batch_id: string;
          verified_by?: string | null;
          organization?: string | null;
          status?: "UNVERIFIED" | "PENDING" | "VERIFIED";
          remarks?: string | null;
          verified_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["verifications"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "verifications_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "batches";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          batch_id: string;
          action: string;
          field_name: string | null;
          old_value: string | null;
          new_value: string | null;
          edited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          action: string;
          field_name?: string | null;
          old_value?: string | null;
          new_value?: string | null;
          edited_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "audit_logs_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "batches";
            referencedColumns: ["id"];
          },
        ];
      };
    };
  };
}

export type Farmer = Database["public"]["Tables"]["farmers"]["Row"];
export type Farm = Database["public"]["Tables"]["farms"]["Row"];
export type Batch = Database["public"]["Tables"]["batches"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Verification = Database["public"]["Tables"]["verifications"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

export type BatchWithFarm = Batch & {
  farms: Farm | null;
};

export type BatchDetail = Batch & {
  farms: Farm | null;
  activities: Activity[];
  verifications: Verification[];
  audit_logs: AuditLog[];
};
