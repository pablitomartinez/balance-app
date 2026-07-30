// Este archivo describe los nombres de tablas disponibles en Supabase.
// No se definen columnas porque el esquema real no está incluido en este repositorio.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ExistingTableName =
  | "profiles"
  | "homes"
  | "home_members"
  | "categories"
  | "services"
  | "expenses"
  | "expense_shares"
  | "transfers"
  | "approvals"
  | "attachments"
  | "activity_logs";

type UnknownRow = Record<string, Json>;

export type Database = {
  public: {
    Tables: Record<
      ExistingTableName,
      {
        Row: UnknownRow;
        Insert: UnknownRow;
        Update: Partial<UnknownRow>;
        Relationships: [];
      }
    >;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
