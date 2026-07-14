// Tipos manuales que reflejan supabase/migrations/*.sql.
// Si el esquema cambia, regenera con `supabase gen types typescript` y reemplaza este archivo.
// `Relationships: []` y `Functions: {}` son requeridos por los tipos genéricos de
// @supabase/postgrest-js aunque no los usemos (no hacemos joins embebidos).

export type ProfileRole = "admin" | "sales";
export type PriceCategory = "panel" | "inverter" | "structure" | "labor" | "other";
export type PriceUnitType = "per_wp" | "per_kwp" | "flat" | "percent";
export type QuoteStatus = "draft" | "calculated" | "sent" | "won" | "lost";
export type OcrConfidence = "auto" | "user_corrected" | "manual";

export interface BudgetLine {
  category: PriceCategory;
  name: string;
  unit_type: PriceUnitType;
  unit_cost_cop: number;
  subtotal_cop: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: ProfileRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: ProfileRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      price_catalog: {
        Row: {
          id: string;
          category: PriceCategory;
          name: string;
          unit_type: PriceUnitType;
          unit_cost_cop: number;
          is_active: boolean;
          notes: string | null;
          updated_by: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: PriceCategory;
          name: string;
          unit_type: PriceUnitType;
          unit_cost_cop: number;
          is_active?: boolean;
          notes?: string | null;
          updated_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["price_catalog"]["Insert"]>;
        Relationships: [];
      };
      app_settings: {
        Row: {
          id: number;
          default_margin_pct: number;
          default_performance_ratio: number;
          default_target_coverage_pct: number;
          company_name: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          default_margin_pct?: number;
          default_performance_ratio?: number;
          default_target_coverage_pct?: number;
          company_name?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["app_settings"]["Insert"]>;
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          status: QuoteStatus;
          created_by: string;

          client_company_name: string | null;
          client_nit: string | null;
          client_contact_name: string | null;
          client_contact_email: string | null;
          client_contact_phone: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;

          bill_image_path: string | null;
          monthly_consumption_kwh: number | null;
          tariff_cop_per_kwh: number | null;
          ocr_raw_text: string | null;
          ocr_confidence: OcrConfidence | null;

          orientation_factor: number | null;
          performance_ratio: number | null;
          target_coverage_pct: number;
          avg_daily_irradiation: number | null;
          required_kwp: number | null;
          estimated_monthly_production_kwh: number | null;
          estimated_monthly_savings_cop: number | null;
          payback_years: number | null;

          budget_breakdown: BudgetLine[] | null;
          margin_pct: number | null;
          total_budget_cop: number | null;
          pdf_storage_path: string | null;

          external_project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          status?: QuoteStatus;
          created_by: string;

          client_company_name?: string | null;
          client_nit?: string | null;
          client_contact_name?: string | null;
          client_contact_email?: string | null;
          client_contact_phone?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;

          bill_image_path?: string | null;
          monthly_consumption_kwh?: number | null;
          tariff_cop_per_kwh?: number | null;
          ocr_raw_text?: string | null;
          ocr_confidence?: OcrConfidence | null;

          orientation_factor?: number | null;
          performance_ratio?: number | null;
          target_coverage_pct?: number;
          avg_daily_irradiation?: number | null;
          required_kwp?: number | null;
          estimated_monthly_production_kwh?: number | null;
          estimated_monthly_savings_cop?: number | null;
          payback_years?: number | null;

          budget_breakdown?: BudgetLine[] | null;
          margin_pct?: number | null;
          total_budget_cop?: number | null;
          pdf_storage_path?: string | null;

          external_project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotes"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PriceCatalogItem = Database["public"]["Tables"]["price_catalog"]["Row"];
export type AppSettings = Database["public"]["Tables"]["app_settings"]["Row"];
export type Quote = Database["public"]["Tables"]["quotes"]["Row"];
