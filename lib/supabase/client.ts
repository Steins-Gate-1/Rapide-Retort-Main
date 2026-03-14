import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance of the Supabase client for Client Components
export const supabase = createClientComponentClient()

// Database types
export interface Patient {
  id: string
  name: string
  age: number
  gender: string
  phone?: string
  emergency_contact?: string
  medical_history?: string
  allergies?: string
  current_medications?: string
  created_at: string
  updated_at: string
}

export interface TriageEntry {
  id: string
  patient_id: string
  severity_level: number
  chief_complaint: string
  vital_signs?: any
  symptoms?: string[]
  triage_nurse?: string
  status: string
  priority_score?: number
  estimated_wait_time?: number
  created_at: string
  updated_at: string
  patients?: Patient
}

export interface HospitalResource {
  id: string
  resource_type: string
  resource_name: string
  total_capacity: number
  current_usage: number
  status: string
  location?: string
  last_updated: string
}

export interface ResourceAllocation {
  id: string
  resource_id: string
  patient_id: string
  allocated_at: string
  released_at?: string
  allocated_by?: string
  hospital_resources?: HospitalResource
  patients?: Patient
}
