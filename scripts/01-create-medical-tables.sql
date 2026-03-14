-- Create tables for the medical triage system

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(10) NOT NULL,
  phone VARCHAR(20),
  emergency_contact VARCHAR(255),
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triage entries table
CREATE TABLE IF NOT EXISTS triage_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  severity_level INTEGER NOT NULL CHECK (severity_level BETWEEN 1 AND 5),
  chief_complaint TEXT NOT NULL,
  vital_signs JSONB,
  symptoms TEXT[],
  triage_nurse VARCHAR(255),
  status VARCHAR(50) DEFAULT 'waiting',
  priority_score INTEGER,
  estimated_wait_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health issue analyses table
CREATE TABLE IF NOT EXISTS health_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  symptoms TEXT[] NOT NULL,
  patient_age INTEGER,
  patient_gender VARCHAR(10),
  differential_diagnoses JSONB,
  confidence_scores JSONB,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stabilization protocols table
CREATE TABLE IF NOT EXISTS stabilization_protocols (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  protocol_type VARCHAR(100) NOT NULL,
  steps_completed JSONB,
  medications_given JSONB,
  vital_signs_log JSONB,
  staff_member VARCHAR(255),
  status VARCHAR(50) DEFAULT 'in_progress',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Hospital resources table
CREATE TABLE IF NOT EXISTS hospital_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_type VARCHAR(100) NOT NULL,
  resource_name VARCHAR(255) NOT NULL,
  total_capacity INTEGER NOT NULL,
  current_usage INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'available',
  location VARCHAR(255),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource allocations table
CREATE TABLE IF NOT EXISTS resource_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES hospital_resources(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  allocated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE,
  allocated_by VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_triage_entries_severity ON triage_entries(severity_level);
CREATE INDEX IF NOT EXISTS idx_triage_entries_status ON triage_entries(status);
CREATE INDEX IF NOT EXISTS idx_triage_entries_created ON triage_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_patients_created ON patients(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_type ON hospital_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON hospital_resources(status);
