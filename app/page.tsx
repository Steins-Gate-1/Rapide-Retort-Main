"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase/client"
import type { HospitalResource, ResourceAllocation } from "@/lib/supabase/client"
import {
  Activity,
  Users,
  Clock,
  AlertTriangle,
  Heart,
  Stethoscope,
  UserPlus,
  Brain,
  Search,
  TrendingUp,
  Shield,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Timer,
  Calculator,
  ClipboardList,
} from "lucide-react"

interface Patient {
  id: string
  name: string
  age: number
  symptoms: string
  triageLevel: "urgent" | "medium" | "low"
  arrivalTime: Date
  status: "waiting" | "in-treatment" | "stable"
  vitals?: {
    heartRate: number
    bloodPressure: string
    temperature: number
  }
}

interface Diagnosis {
  condition: string
  confidence: number
  description: string
  urgency: "urgent" | "medium" | "low"
  recommendations: string[]
  commonSymptoms: string[]
}

interface HIAAnalysis {
  patientId?: string
  symptoms: string[]
  demographics: {
    age: number
    gender: string
    medicalHistory: string
  }
  diagnoses: Diagnosis[]
  riskFactors: string[]
  recommendedTests: string[]
}

interface SurgeData {
  hour: string
  predicted: number
  actual: number
  urgent: number
  medium: number
  low: number
}

interface ResourcePrediction {
  resource: string
  current: number
  predicted: number
  capacity: number
  utilizationRate: number
  status: "normal" | "warning" | "critical"
}

interface HistoricalTrend {
  date: string
  patients: number
  avgWaitTime: number
  satisfaction: number
}

interface StabilizationProtocol {
  id: string
  name: string
  condition: string
  urgency: "urgent" | "medium" | "low"
  description: string
  steps: ProtocolStep[]
  medications: Medication[]
  vitalsToMonitor: string[]
  estimatedDuration: number
}

interface ProtocolStep {
  id: string
  title: string
  description: string
  duration?: number
  isCompleted: boolean
  isActive: boolean
  checklistItems?: string[]
  criticalNote?: string
}

interface Medication {
  name: string
  dosage: string
  route: string
  frequency: string
  calculator?: {
    weightBased: boolean
    formula: string
    unit: string
  }
}

interface ActiveProtocol {
  protocolId: string
  patientId: string
  startTime: Date
  currentStepIndex: number
  completedSteps: string[]
  timerActive: boolean
  timeRemaining: number
}

export default function TriageDashboard() {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "1",
      name: "Rajesh Kumar",
      age: 45,
      symptoms: "Chest pain, shortness of breath",
      triageLevel: "urgent",
      arrivalTime: new Date(Date.now() - 15 * 60000),
      status: "in-treatment",
      vitals: { heartRate: 110, bloodPressure: "140/90", temperature: 98.6 },
    },
    {
      id: "2",
      name: "Priya Sharma",
      age: 28,
      symptoms: "Severe headache, nausea",
      triageLevel: "medium",
      arrivalTime: new Date(Date.now() - 30 * 60000),
      status: "waiting",
      vitals: { heartRate: 85, bloodPressure: "120/80", temperature: 99.2 },
    },
    {
      id: "3",
      name: "Amit Patel",
      age: 35,
      symptoms: "Minor cut on hand",
      triageLevel: "low",
      arrivalTime: new Date(Date.now() - 45 * 60000),
      status: "stable",
    },
  ])

  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    symptoms: "",
    triageLevel: "" as "urgent" | "medium" | "low" | "",
  })

  const [hiaAnalysis, setHiaAnalysis] = useState<HIAAnalysis>({
    symptoms: [],
    demographics: { age: 0, gender: "", medicalHistory: "" },
    diagnoses: [],
    riskFactors: [],
    recommendedTests: [],
  })

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [customSymptom, setCustomSymptom] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const commonSymptoms = [
    "Chest pain",
    "Shortness of breath",
    "Headache",
    "Nausea",
    "Vomiting",
    "Fever",
    "Cough",
    "Abdominal pain",
    "Dizziness",
    "Fatigue",
    "Back pain",
    "Joint pain",
    "Rash",
    "Sore throat",
    "Difficulty swallowing",
    "Palpitations",
    "Sweating",
    "Confusion",
    "Seizure",
    "Loss of consciousness",
  ]

  const [currentTime, setCurrentTime] = useState(new Date())

  const [surgeData, setSurgeData] = useState<SurgeData[]>([
    { hour: "00:00", predicted: 12, actual: 10, urgent: 2, medium: 4, low: 6 },
    { hour: "02:00", predicted: 8, actual: 9, urgent: 1, medium: 3, low: 5 },
    { hour: "04:00", predicted: 6, actual: 7, urgent: 1, medium: 2, low: 4 },
    { hour: "06:00", predicted: 15, actual: 14, urgent: 3, medium: 6, low: 5 },
    { hour: "08:00", predicted: 25, actual: 23, urgent: 5, medium: 10, low: 8 },
    { hour: "10:00", predicted: 30, actual: 28, urgent: 6, medium: 12, low: 10 },
    { hour: "12:00", predicted: 35, actual: 32, urgent: 8, medium: 15, low: 9 },
    { hour: "14:00", predicted: 40, actual: 38, urgent: 10, medium: 18, low: 10 },
    { hour: "16:00", predicted: 45, actual: 42, urgent: 12, medium: 20, low: 10 },
    { hour: "18:00", predicted: 38, actual: 35, urgent: 9, medium: 16, low: 10 },
    { hour: "20:00", predicted: 28, actual: 26, urgent: 6, medium: 12, low: 8 },
    { hour: "22:00", predicted: 18, actual: 16, urgent: 3, medium: 8, low: 5 },
  ])

  const [resourcePredictions, setResourcePredictions] = useState<ResourcePrediction[]>([
    { resource: "Emergency Beds", current: 18, predicted: 24, capacity: 30, utilizationRate: 80, status: "warning" },
    { resource: "ICU Beds", current: 8, predicted: 12, capacity: 15, utilizationRate: 80, status: "warning" },
    { resource: "Nursing Staff", current: 12, predicted: 16, capacity: 20, utilizationRate: 80, status: "normal" },
    { resource: "Doctors", current: 6, predicted: 8, capacity: 10, utilizationRate: 80, status: "normal" },
    { resource: "Ventilators", current: 3, predicted: 5, capacity: 8, utilizationRate: 62.5, status: "normal" },
    { resource: "Operating Rooms", current: 2, predicted: 4, capacity: 6, utilizationRate: 66.7, status: "normal" },
  ])

  const [historicalTrends, setHistoricalTrends] = useState<HistoricalTrend[]>([
    { date: "Mon", patients: 120, avgWaitTime: 45, satisfaction: 85 },
    { date: "Tue", patients: 135, avgWaitTime: 52, satisfaction: 82 },
    { date: "Wed", patients: 148, avgWaitTime: 48, satisfaction: 84 },
    { date: "Thu", patients: 162, avgWaitTime: 55, satisfaction: 80 },
    { date: "Fri", patients: 178, avgWaitTime: 62, satisfaction: 78 },
    { date: "Sat", patients: 195, avgWaitTime: 58, satisfaction: 79 },
    { date: "Sun", patients: 142, avgWaitTime: 41, satisfaction: 87 },
  ])

  const [selectedTimeframe, setSelectedTimeframe] = useState("24h")

  const [stabilizationProtocols, setStabilizationProtocols] = useState<StabilizationProtocol[]>([
    {
      id: "asthma-acute",
      name: "Acute Asthma Exacerbation",
      condition: "Respiratory Emergency",
      urgency: "urgent",
      description: "Immediate stabilization protocol for severe asthma attack",
      estimatedDuration: 30,
      steps: [
        {
          id: "assess",
          title: "Initial Assessment",
          description: "Rapid assessment of respiratory distress and oxygen saturation",
          duration: 2,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Check oxygen saturation (target >92%)",
            "Assess respiratory rate and effort",
            "Listen for wheeze and air entry",
            "Check peak flow if possible",
          ],
          criticalNote: "If SpO2 <90% or silent chest, consider intubation",
        },
        {
          id: "oxygen",
          title: "Oxygen Therapy",
          description: "Administer high-flow oxygen immediately",
          duration: 1,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Apply high-flow oxygen (15L/min via non-rebreather)",
            "Monitor SpO2 continuously",
            "Target SpO2 94-98%",
          ],
        },
        {
          id: "bronchodilator",
          title: "Bronchodilator Administration",
          description: "Nebulized salbutamol and ipratropium",
          duration: 15,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Salbutamol 5mg nebulized",
            "Ipratropium 500mcg nebulized",
            "Can repeat every 20 minutes",
            "Monitor heart rate and tremor",
          ],
        },
        {
          id: "steroids",
          title: "Corticosteroids",
          description: "Systemic steroids to reduce inflammation",
          duration: 5,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Prednisolone 40-50mg PO or",
            "Hydrocortisone 200mg IV if unable to swallow",
            "Continue for 5-7 days",
          ],
        },
        {
          id: "reassess",
          title: "Reassessment",
          description: "Evaluate response to treatment",
          duration: 5,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Repeat SpO2 and respiratory assessment",
            "Check peak flow improvement",
            "Assess need for additional treatments",
            "Consider magnesium if poor response",
          ],
        },
      ],
      medications: [
        {
          name: "Salbutamol",
          dosage: "5mg",
          route: "Nebulized",
          frequency: "Every 20 minutes PRN",
        },
        {
          name: "Ipratropium",
          dosage: "500mcg",
          route: "Nebulized",
          frequency: "Every 20 minutes PRN",
        },
        {
          name: "Prednisolone",
          dosage: "40-50mg",
          route: "Oral",
          frequency: "Once daily for 5-7 days",
        },
      ],
      vitalsToMonitor: ["SpO2", "Respiratory Rate", "Heart Rate", "Blood Pressure", "Peak Flow"],
    },
    {
      id: "hypoglycemia",
      name: "Severe Hypoglycemia",
      condition: "Endocrine Emergency",
      urgency: "urgent",
      description: "Rapid correction of severe hypoglycemia",
      estimatedDuration: 20,
      steps: [
        {
          id: "bgl-check",
          title: "Blood Glucose Check",
          description: "Confirm hypoglycemia with rapid glucose test",
          duration: 1,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Perform fingerstick glucose test",
            "Confirm BGL <4.0 mmol/L (72 mg/dL)",
            "Assess level of consciousness",
          ],
          criticalNote: "If unconscious or unable to swallow, give IV glucose immediately",
        },
        {
          id: "iv-access",
          title: "IV Access",
          description: "Establish intravenous access for glucose administration",
          duration: 3,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Insert large bore IV cannula",
            "Draw blood for formal glucose and ketones",
            "Prepare 50% dextrose solution",
          ],
        },
        {
          id: "glucose-admin",
          title: "Glucose Administration",
          description: "Administer IV glucose to correct hypoglycemia",
          duration: 2,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Give 25g glucose (50ml of 50% dextrose) IV",
            "Can repeat if BGL remains <4.0 mmol/L",
            "Monitor for improvement in consciousness",
          ],
        },
        {
          id: "reassess-bgl",
          title: "Reassess Blood Glucose",
          description: "Check response to glucose administration",
          duration: 5,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Recheck BGL after 5-10 minutes",
            "Target BGL >5.0 mmol/L (90 mg/dL)",
            "Assess neurological improvement",
            "Consider glucagon if no IV access",
          ],
        },
        {
          id: "maintenance",
          title: "Maintenance Therapy",
          description: "Prevent recurrent hypoglycemia",
          duration: 10,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Start 10% dextrose infusion if needed",
            "Provide oral carbohydrates when conscious",
            "Monitor BGL every 15-30 minutes",
            "Investigate underlying cause",
          ],
        },
      ],
      medications: [
        {
          name: "50% Dextrose",
          dosage: "25g (50ml)",
          route: "IV",
          frequency: "Stat, repeat PRN",
        },
        {
          name: "Glucagon",
          dosage: "1mg",
          route: "IM/SC",
          frequency: "Stat if no IV access",
        },
      ],
      vitalsToMonitor: ["Blood Glucose", "Level of Consciousness", "Heart Rate", "Blood Pressure"],
    },
    {
      id: "cardiac-arrest",
      name: "Cardiac Arrest - Adult",
      condition: "Cardiac Emergency",
      urgency: "urgent",
      description: "Advanced life support protocol for cardiac arrest",
      estimatedDuration: 45,
      steps: [
        {
          id: "cpr-start",
          title: "Begin CPR",
          description: "Immediate high-quality chest compressions",
          duration: 2,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Check responsiveness and pulse (max 10 seconds)",
            "Begin chest compressions 100-120/min",
            "Compression depth 5-6cm",
            "Allow complete chest recoil",
          ],
          criticalNote: "Minimize interruptions to chest compressions",
        },
        {
          id: "airway-breathing",
          title: "Airway & Breathing",
          description: "Secure airway and provide ventilation",
          duration: 3,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Insert supraglottic airway or intubate",
            "Ventilate 10 breaths/min",
            "Confirm tube placement with capnography",
            "Avoid hyperventilation",
          ],
        },
        {
          id: "defibrillation",
          title: "Defibrillation",
          description: "Analyze rhythm and defibrillate if indicated",
          duration: 1,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Attach defibrillator pads",
            "Analyze rhythm every 2 minutes",
            "Defibrillate VF/VT with 200J biphasic",
            "Resume CPR immediately after shock",
          ],
        },
        {
          id: "medications",
          title: "Medications",
          description: "Administer ACLS medications",
          duration: 2,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Adrenaline 1mg IV every 3-5 minutes",
            "Amiodarone 300mg IV for VF/VT",
            "Consider reversible causes (4 H's & 4 T's)",
            "Sodium bicarbonate if indicated",
          ],
        },
        {
          id: "rosc-check",
          title: "ROSC Assessment",
          description: "Check for return of spontaneous circulation",
          duration: 1,
          isCompleted: false,
          isActive: false,
          checklistItems: [
            "Check pulse during rhythm analysis",
            "Look for signs of life",
            "Monitor capnography waveform",
            "Continue CPR if no ROSC",
          ],
        },
      ],
      medications: [
        {
          name: "Adrenaline",
          dosage: "1mg",
          route: "IV",
          frequency: "Every 3-5 minutes",
        },
        {
          name: "Amiodarone",
          dosage: "300mg",
          route: "IV",
          frequency: "Once for VF/VT",
        },
      ],
      vitalsToMonitor: ["ECG Rhythm", "Capnography", "Pulse Check", "Blood Pressure"],
    },
  ])

  const [activeProtocol, setActiveProtocol] = useState<ActiveProtocol | null>(null)
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>("")
  const [patientWeight, setPatientWeight] = useState<number>(70)
  const [protocolTimer, setProtocolTimer] = useState<number>(0)

  const [hospitalResources, setHospitalResources] = useState<HospitalResource[]>([])
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(true)
  const [selectedResourceType, setSelectedResourceType] = useState<string>("all")
  const [newAllocation, setNewAllocation] = useState({
    resourceId: "",
    patientId: "",
    allocatedBy: "",
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const isSupabaseConfigured = !!supabase

  useEffect(() => {
    fetchHospitalResources()
    fetchResourceAllocations()

    // Set up real-time subscriptions
    const resourcesSubscription = supabase
      .channel("hospital_resources")
      .on("postgres_changes", { event: "*", schema: "public", table: "hospital_resources" }, (payload) => {
        console.log("Resource change received!", payload)
        fetchHospitalResources()
      })
      .subscribe()

    const allocationsSubscription = supabase
      .channel("resource_allocations")
      .on("postgres_changes", { event: "*", schema: "public", table: "resource_allocations" }, (payload) => {
        console.log("Allocation change received!", payload)
        fetchResourceAllocations()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(resourcesSubscription)
      supabase.removeChannel(allocationsSubscription)
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeProtocol?.timerActive && activeProtocol.timeRemaining > 0) {
      interval = setInterval(() => {
        setActiveProtocol((prev) => {
          if (!prev) return null
          const newTimeRemaining = prev.timeRemaining - 1
          if (newTimeRemaining <= 0) {
            // Auto-advance to next step when timer completes
            const protocol = stabilizationProtocols.find((p) => p.id === prev.protocolId)
            if (protocol && prev.currentStepIndex < protocol.steps.length - 1) {
              return {
                ...prev,
                currentStepIndex: prev.currentStepIndex + 1,
                timeRemaining: protocol.steps[prev.currentStepIndex + 1].duration
                  ? protocol.steps[prev.currentStepIndex + 1].duration! * 60
                  : 0,
                timerActive: false,
              }
            }
            return { ...prev, timeRemaining: 0, timerActive: false }
          }
          return { ...prev, timeRemaining: newTimeRemaining }
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeProtocol?.timerActive, activeProtocol?.timeRemaining, stabilizationProtocols])

  const fetchHospitalResources = async () => {
    try {
      const { data, error } = await supabase
        .from("hospital_resources")
        .select("*")
        .order("resource_type", { ascending: true })

      if (error) throw error
      setHospitalResources(data || [])
    } catch (error) {
      console.error("Error fetching hospital resources:", error)
    } finally {
      setIsLoadingResources(false)
    }
  }

  const fetchResourceAllocations = async () => {
    try {
      if (!isSupabaseConfigured) {
        console.warn("Supabase is not configured. Using mock data.")
        setResourceAllocations([])
        return
      }

      const { data, error } = await supabase
        .from("resource_allocations")
        .select(`
          *,
          hospital_resources (*),
          patients (*)
        `)
        .is("released_at", null)
        .order("allocated_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      setResourceAllocations(data || [])
    } catch (error) {
      console.error("Error fetching resource allocations:", error)
      setResourceAllocations([])
    }
  }

  const allocateResource = async () => {
    if (!newAllocation.resourceId || !newAllocation.patientId) return

    try {
      // First, update the resource usage
      const resource = hospitalResources.find((r) => r.id === newAllocation.resourceId)
      if (!resource) return

      const { error: updateError } = await supabase
        .from("hospital_resources")
        .update({
          current_usage: resource.current_usage + 1,
          last_updated: new Date().toISOString(),
        })
        .eq("id", newAllocation.resourceId)

      if (updateError) throw updateError

      // Then create the allocation record
      const { error: insertError } = await supabase.from("resource_allocations").insert({
        resource_id: newAllocation.resourceId,
        patient_id: newAllocation.patientId,
        allocated_by: newAllocation.allocatedBy || "System",
        allocated_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      // Reset form
      setNewAllocation({ resourceId: "", patientId: "", allocatedBy: "" })

      // Refresh data
      fetchHospitalResources()
      fetchResourceAllocations()
    } catch (error) {
      console.error("Error allocating resource:", error)
    }
  }

  const releaseResource = async (allocationId: string, resourceId: string) => {
    try {
      // Update the allocation to mark as released
      const { error: updateAllocationError } = await supabase
        .from("resource_allocations")
        .update({ released_at: new Date().toISOString() })
        .eq("id", allocationId)

      if (updateAllocationError) throw updateAllocationError

      // Update the resource usage
      const resource = hospitalResources.find((r) => r.id === resourceId)
      if (resource) {
        const { error: updateResourceError } = await supabase
          .from("hospital_resources")
          .update({
            current_usage: Math.max(0, resource.current_usage - 1),
            last_updated: new Date().toISOString(),
          })
          .eq("id", resourceId)

        if (updateResourceError) throw updateResourceError
      }

      // Refresh data
      fetchHospitalResources()
      fetchResourceAllocations()
    } catch (error) {
      console.error("Error releasing resource:", error)
    }
  }

  const getResourceUtilization = (resource: HospitalResource) => {
    return (resource.current_usage / resource.total_capacity) * 100
  }

  const getResourceStatusColorByUtilization = (utilization: number) => {
    if (utilization >= 90) return "text-red-600 bg-red-50 border-red-200"
    if (utilization >= 75) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-emerald-600 bg-emerald-50 border-emerald-200"
  }

  const filteredResources =
    selectedResourceType === "all"
      ? hospitalResources
      : hospitalResources.filter((r) => r.resource_type === selectedResourceType)

  const resourceTypes = [...new Set(hospitalResources.map((r) => r.resource_type))]

  const startProtocol = (protocolId: string, patientId: string) => {
    const protocol = stabilizationProtocols.find((p) => p.id === protocolId)
    if (!protocol) return

    const newActiveProtocol: ActiveProtocol = {
      protocolId,
      patientId,
      startTime: new Date(),
      currentStepIndex: 0,
      completedSteps: [],
      timerActive: false,
      timeRemaining: protocol.steps[0].duration ? protocol.steps[0].duration * 60 : 0,
    }

    setActiveProtocol(newActiveProtocol)

    // Update protocol steps to mark first as active
    setStabilizationProtocols((prev) =>
      prev.map((p) => {
        if (p.id === protocolId) {
          return {
            ...p,
            steps: p.steps.map((step, index) => ({
              ...step,
              isActive: index === 0,
              isCompleted: false,
            })),
          }
        }
        return p
      }),
    )
  }

  const completeCurrentStep = () => {
    if (!activeProtocol) return

    const protocol = stabilizationProtocols.find((p) => p.id === activeProtocol.protocolId)
    if (!protocol) return

    const currentStep = protocol.steps[activeProtocol.currentStepIndex]

    setActiveProtocol((prev) => {
      if (!prev) return null
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, currentStep.id],
        timerActive: false,
      }
    })

    // Update protocol steps
    setStabilizationProtocols((prev) =>
      prev.map((p) => {
        if (p.id === activeProtocol.protocolId) {
          return {
            ...p,
            steps: p.steps.map((step, index) => ({
              ...step,
              isCompleted: index === activeProtocol.currentStepIndex ? true : step.isCompleted,
              isActive: false,
            })),
          }
        }
        return p
      }),
    )
  }

  const advanceToNextStep = () => {
    if (!activeProtocol) return

    const protocol = stabilizationProtocols.find((p) => p.id === activeProtocol.protocolId)
    if (!protocol || activeProtocol.currentStepIndex >= protocol.steps.length - 1) return

    const nextStepIndex = activeProtocol.currentStepIndex + 1
    const nextStep = protocol.steps[nextStepIndex]

    setActiveProtocol((prev) => {
      if (!prev) return null
      return {
        ...prev,
        currentStepIndex: nextStepIndex,
        timeRemaining: nextStep.duration ? nextStep.duration * 60 : 0,
        timerActive: false,
      }
    })

    // Update protocol steps
    setStabilizationProtocols((prev) =>
      prev.map((p) => {
        if (p.id === activeProtocol.protocolId) {
          return {
            ...p,
            steps: p.steps.map((step, index) => ({
              ...step,
              isActive: index === nextStepIndex,
            })),
          }
        }
        return p
      }),
    )
  }

  const startStepTimer = () => {
    setActiveProtocol((prev) => {
      if (!prev) return null
      return { ...prev, timerActive: true }
    })
  }

  const pauseStepTimer = () => {
    setActiveProtocol((prev) => {
      if (!prev) return null
      return { ...prev, timerActive: false }
    })
  }

  const resetStepTimer = () => {
    if (!activeProtocol) return

    const protocol = stabilizationProtocols.find((p) => p.id === activeProtocol.protocolId)
    if (!protocol) return

    const currentStep = protocol.steps[activeProtocol.currentStepIndex]

    setActiveProtocol((prev) => {
      if (!prev) return null
      return {
        ...prev,
        timeRemaining: currentStep.duration ? currentStep.duration * 60 : 0,
        timerActive: false,
      }
    })
  }

  const calculateDosage = (medication: Medication, weight: number): string => {
    if (!medication.calculator) return medication.dosage

    if (medication.calculator.weightBased) {
      // Simple weight-based calculation
      const baseAmount = Number.parseFloat(medication.dosage.replace(/[^\d.]/g, ""))
      const calculatedAmount = ((baseAmount * weight) / 70).toFixed(1) // Assuming 70kg reference
      return `${calculatedAmount}${medication.calculator.unit}`
    }

    return medication.dosage
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const performHIAAnalysis = async () => {
    setIsAnalyzing(true)

    // Simulate ML processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock ML-powered differential diagnosis
    const mockDiagnoses: Diagnosis[] = []

    if (selectedSymptoms.includes("Chest pain") && selectedSymptoms.includes("Shortness of breath")) {
      mockDiagnoses.push({
        condition: "Acute Coronary Syndrome",
        confidence: 85,
        description: "Potential heart attack or unstable angina requiring immediate intervention",
        urgency: "urgent",
        recommendations: [
          "Immediate ECG and cardiac enzymes",
          "Administer aspirin 325mg",
          "Oxygen therapy if SpO2 < 90%",
          "Prepare for emergency catheterization",
        ],
        commonSymptoms: ["Chest pain", "Shortness of breath", "Sweating", "Nausea"],
      })

      mockDiagnoses.push({
        condition: "Pulmonary Embolism",
        confidence: 65,
        description: "Blood clot in lung arteries causing breathing difficulties",
        urgency: "urgent",
        recommendations: [
          "CT pulmonary angiogram",
          "D-dimer test",
          "Anticoagulation therapy",
          "Monitor oxygen saturation",
        ],
        commonSymptoms: ["Shortness of breath", "Chest pain", "Cough", "Palpitations"],
      })
    }

    if (selectedSymptoms.includes("Headache") && selectedSymptoms.includes("Nausea")) {
      mockDiagnoses.push({
        condition: "Migraine",
        confidence: 75,
        description: "Severe headache with associated symptoms",
        urgency: "medium",
        recommendations: [
          "Administer sumatriptan or similar triptan",
          "Dark, quiet environment",
          "IV fluids if dehydrated",
          "Anti-nausea medication",
        ],
        commonSymptoms: ["Headache", "Nausea", "Vomiting", "Light sensitivity"],
      })

      mockDiagnoses.push({
        condition: "Intracranial Pressure",
        confidence: 45,
        description: "Increased pressure within the skull requiring evaluation",
        urgency: "urgent",
        recommendations: [
          "Immediate CT scan of head",
          "Neurological assessment",
          "Monitor vital signs closely",
          "Consider neurosurgical consultation",
        ],
        commonSymptoms: ["Headache", "Nausea", "Vomiting", "Confusion"],
      })
    }

    if (selectedSymptoms.includes("Fever") && selectedSymptoms.includes("Cough")) {
      mockDiagnoses.push({
        condition: "Pneumonia",
        confidence: 70,
        description: "Lung infection requiring antibiotic treatment",
        urgency: "medium",
        recommendations: ["Chest X-ray", "Blood cultures", "Start empirical antibiotics", "Monitor oxygen saturation"],
        commonSymptoms: ["Fever", "Cough", "Shortness of breath", "Fatigue"],
      })
    }

    // Default diagnosis for any symptoms
    if (mockDiagnoses.length === 0) {
      mockDiagnoses.push({
        condition: "Viral Syndrome",
        confidence: 60,
        description: "Common viral infection with supportive care",
        urgency: "low",
        recommendations: [
          "Symptomatic treatment",
          "Rest and hydration",
          "Monitor for worsening symptoms",
          "Follow-up in 48-72 hours",
        ],
        commonSymptoms: ["Fever", "Fatigue", "Body aches", "Headache"],
      })
    }

    const analysis: HIAAnalysis = {
      symptoms: selectedSymptoms,
      demographics: hiaAnalysis.demographics,
      diagnoses: mockDiagnoses.sort((a, b) => b.confidence - a.confidence),
      riskFactors: ["Age > 40 years", "Smoking history", "Hypertension", "Diabetes mellitus"],
      recommendedTests: ["Complete Blood Count", "Basic Metabolic Panel", "ECG", "Chest X-ray"],
    }

    setHiaAnalysis(analysis)
    setIsAnalyzing(false)
  }

  const addSymptom = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
  }

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom))
  }

  const addCustomSymptom = () => {
    if (customSymptom && !selectedSymptoms.includes(customSymptom)) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom])
      setCustomSymptom("")
    }
  }

  const addPatient = () => {
    if (newPatient.name && newPatient.age && newPatient.symptoms && newPatient.triageLevel) {
      const patient: Patient = {
        id: Date.now().toString(),
        name: newPatient.name,
        age: Number.parseInt(newPatient.age),
        symptoms: newPatient.symptoms,
        triageLevel: newPatient.triageLevel,
        arrivalTime: new Date(),
        status: "waiting",
      }
      setPatients([...patients, patient])
      setNewPatient({ name: "", age: "", symptoms: "", triageLevel: "" })
    }
  }

  const getTriageColor = (level: string) => {
    switch (level) {
      case "urgent":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
        return "bg-emerald-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-treatment":
        return "bg-blue-500 text-white"
      case "waiting":
        return "bg-orange-500 text-white"
      case "stable":
        return "bg-emerald-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getResourceStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-emerald-600 bg-emerald-50 border-emerald-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const generateCapacityRecommendations = () => {
    const recommendations = []

    resourcePredictions.forEach((resource) => {
      if (resource.utilizationRate > 85) {
        recommendations.push({
          type: "critical",
          message: `${resource.resource}: Consider increasing capacity - predicted ${resource.predicted}/${resource.capacity} (${resource.utilizationRate.toFixed(1)}% utilization)`,
        })
      } else if (resource.utilizationRate > 70) {
        recommendations.push({
          type: "warning",
          message: `${resource.resource}: Monitor closely - approaching capacity limits`,
        })
      }
    })

    return recommendations
  }

  const capacityRecommendations = generateCapacityRecommendations()

  const urgentCount = patients.filter((p) => p.triageLevel === "urgent").length
  const mediumCount = patients.filter((p) => p.triageLevel === "medium").length
  const lowCount = patients.filter((p) => p.triageLevel === "low").length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-serif font-bold text-slate-800">Rapide Retort</h1>
            </div>
            <Badge variant="outline" className="ml-4">
              Real-Time Patient Triage Dashboard
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">Currently in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
              <p className="text-xs text-muted-foreground">Immediate attention needed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
              <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{mediumCount}</div>
              <p className="text-xs text-muted-foreground">Moderate urgency</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Priority</CardTitle>
              <Heart className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{lowCount}</div>
              <p className="text-xs text-muted-foreground">Stable condition</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert for urgent cases */}
        {urgentCount > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Urgent Alert:</strong> {urgentCount} patient{urgentCount > 1 ? "s" : ""} require immediate
              attention. Your prompt action saves lives.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Patient Overview</TabsTrigger>
            <TabsTrigger value="intake">New Patient Intake</TabsTrigger>
            <TabsTrigger value="hia">Health Issue Analyzer</TabsTrigger>
            <TabsTrigger value="protocols">Stabilization Protocols</TabsTrigger>
            <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
            <TabsTrigger value="resources">Resource Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Urgent Patients */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Urgent Cases
                  </CardTitle>
                  <CardDescription>Patients requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patients
                    .filter((p) => p.triageLevel === "urgent")
                    .map((patient) => (
                      <div key={patient.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-red-900">{patient.name}</h4>
                          <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                        </div>
                        <p className="text-sm text-red-700 mb-2">{patient.symptoms}</p>
                        <div className="flex justify-between text-xs text-red-600">
                          <span>Age: {patient.age}</span>
                          <span>Arrived: {Math.floor((Date.now() - patient.arrivalTime.getTime()) / 60000)}m ago</span>
                        </div>
                        {patient.vitals && (
                          <div className="mt-2 text-xs text-red-600">
                            HR: {patient.vitals.heartRate} | BP: {patient.vitals.bloodPressure} | Temp:{" "}
                            {patient.vitals.temperature}°F
                          </div>
                        )}
                      </div>
                    ))}
                  {patients.filter((p) => p.triageLevel === "urgent").length === 0 && (
                    <p className="text-sm text-muted-foreground">No urgent cases currently</p>
                  )}
                </CardContent>
              </Card>

              {/* Medium Priority Patients */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-yellow-600 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Medium Priority
                  </CardTitle>
                  <CardDescription>Patients with moderate urgency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patients
                    .filter((p) => p.triageLevel === "medium")
                    .map((patient) => (
                      <div key={patient.id} className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-yellow-900">{patient.name}</h4>
                          <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                        </div>
                        <p className="text-sm text-yellow-700 mb-2">{patient.symptoms}</p>
                        <div className="flex justify-between text-xs text-yellow-600">
                          <span>Age: {patient.age}</span>
                          <span>Arrived: {Math.floor((Date.now() - patient.arrivalTime.getTime()) / 60000)}m ago</span>
                        </div>
                        {patient.vitals && (
                          <div className="mt-2 text-xs text-yellow-600">
                            HR: {patient.vitals.heartRate} | BP: {patient.vitals.bloodPressure} | Temp:{" "}
                            {patient.vitals.temperature}°F
                          </div>
                        )}
                      </div>
                    ))}
                  {patients.filter((p) => p.triageLevel === "medium").length === 0 && (
                    <p className="text-sm text-muted-foreground">No medium priority cases currently</p>
                  )}
                </CardContent>
              </Card>

              {/* Low Priority Patients */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-emerald-600 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Low Priority
                  </CardTitle>
                  <CardDescription>Stable patients</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patients
                    .filter((p) => p.triageLevel === "low")
                    .map((patient) => (
                      <div key={patient.id} className="p-3 border border-emerald-200 rounded-lg bg-emerald-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-emerald-900">{patient.name}</h4>
                          <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                        </div>
                        <p className="text-sm text-emerald-700 mb-2">{patient.symptoms}</p>
                        <div className="flex justify-between text-xs text-emerald-600">
                          <span>Age: {patient.age}</span>
                          <span>Arrived: {Math.floor((Date.now() - patient.arrivalTime.getTime()) / 60000)}m ago</span>
                        </div>
                      </div>
                    ))}
                  {patients.filter((p) => p.triageLevel === "low").length === 0 && (
                    <p className="text-sm text-muted-foreground">No low priority cases currently</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="intake" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  New Patient Arrival
                </CardTitle>
                <CardDescription>Register a new patient and assign triage level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Patient Name</Label>
                    <Input
                      id="name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                      placeholder="Enter age"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    value={newPatient.symptoms}
                    onChange={(e) => setNewPatient({ ...newPatient, symptoms: e.target.value })}
                    placeholder="Describe symptoms and chief complaint"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="triage">Triage Level</Label>
                  <Select
                    value={newPatient.triageLevel}
                    onValueChange={(value: "urgent" | "medium" | "low") =>
                      setNewPatient({ ...newPatient, triageLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select triage level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">🔴 Urgent - Immediate attention required</SelectItem>
                      <SelectItem value="medium">🟡 Medium - Moderate urgency</SelectItem>
                      <SelectItem value="low">🟢 Low - Stable condition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={addPatient}
                  className="w-full"
                  disabled={!newPatient.name || !newPatient.age || !newPatient.symptoms || !newPatient.triageLevel}
                >
                  Register Patient
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hia" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Symptom Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-emerald-600" />
                    Health Issue Analyzer (HIA)
                  </CardTitle>
                  <CardDescription>AI-powered differential diagnosis and treatment recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Patient Demographics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={hiaAnalysis.demographics.age || ""}
                        onChange={(e) =>
                          setHiaAnalysis({
                            ...hiaAnalysis,
                            demographics: { ...hiaAnalysis.demographics, age: Number.parseInt(e.target.value) || 0 },
                          })
                        }
                        placeholder="Patient age"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={hiaAnalysis.demographics.gender}
                        onValueChange={(value) =>
                          setHiaAnalysis({
                            ...hiaAnalysis,
                            demographics: { ...hiaAnalysis.demographics, gender: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="space-y-2">
                    <Label>Medical History</Label>
                    <Textarea
                      value={hiaAnalysis.demographics.medicalHistory}
                      onChange={(e) =>
                        setHiaAnalysis({
                          ...hiaAnalysis,
                          demographics: { ...hiaAnalysis.demographics, medicalHistory: e.target.value },
                        })
                      }
                      placeholder="Previous conditions, medications, allergies..."
                      rows={2}
                    />
                  </div>

                  {/* Symptom Selection */}
                  <div className="space-y-2">
                    <Label>Common Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {commonSymptoms.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={symptom}
                            checked={selectedSymptoms.includes(symptom)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                addSymptom(symptom)
                              } else {
                                removeSymptom(symptom)
                              }
                            }}
                          />
                          <Label htmlFor={symptom} className="text-sm">
                            {symptom}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Symptom Input */}
                  <div className="space-y-2">
                    <Label>Additional Symptoms</Label>
                    <div className="flex gap-2">
                      <Input
                        value={customSymptom}
                        onChange={(e) => setCustomSymptom(e.target.value)}
                        placeholder="Enter custom symptom"
                      />
                      <Button onClick={addCustomSymptom} size="sm">
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Selected Symptoms */}
                  {selectedSymptoms.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Symptoms</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedSymptoms.map((symptom) => (
                          <Badge
                            key={symptom}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeSymptom(symptom)}
                          >
                            {symptom} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analyze Button */}
                  <Button
                    onClick={performHIAAnalysis}
                    disabled={selectedSymptoms.length === 0 || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Search className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Analyze Symptoms
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Differential Diagnosis
                  </CardTitle>
                  <CardDescription>AI-powered analysis results with confidence scores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hiaAnalysis.diagnoses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select symptoms and click "Analyze Symptoms" to get AI-powered diagnosis suggestions</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hiaAnalysis.diagnoses.map((diagnosis, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-lg">{diagnosis.condition}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getTriageColor(diagnosis.urgency)}>
                                {diagnosis.urgency.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-medium">{diagnosis.confidence}%</span>
                            </div>
                          </div>

                          <Progress value={diagnosis.confidence} className="h-2" />

                          <p className="text-sm text-muted-foreground">{diagnosis.description}</p>

                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Recommended Actions:</h5>
                            <ul className="text-sm space-y-1">
                              {diagnosis.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-emerald-600 mt-1">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Common Associated Symptoms:</h5>
                            <div className="flex flex-wrap gap-1">
                              {diagnosis.commonSymptoms.map((symptom, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Risk Factors */}
                      {hiaAnalysis.riskFactors.length > 0 && (
                        <div className="border rounded-lg p-4 bg-yellow-50">
                          <h4 className="font-medium text-yellow-800 mb-2">Risk Factors to Consider</h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {hiaAnalysis.riskFactors.map((factor, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommended Tests */}
                      {hiaAnalysis.recommendedTests.length > 0 && (
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <h4 className="font-medium text-blue-800 mb-2">Recommended Diagnostic Tests</h4>
                          <div className="flex flex-wrap gap-2">
                            {hiaAnalysis.recommendedTests.map((test, i) => (
                              <Badge key={i} variant="outline" className="bg-white text-blue-700 border-blue-200">
                                {test}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="protocols" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Protocol Selection */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Emergency Protocols
                  </CardTitle>
                  <CardDescription>Select and initiate stabilization protocols</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Patient Selection */}
                  <div className="space-y-2">
                    <Label>Select Patient</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} - {patient.symptoms}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Patient Weight for Dosage Calculations */}
                  <div className="space-y-2">
                    <Label>Patient Weight (kg)</Label>
                    <Input
                      type="number"
                      value={patientWeight}
                      onChange={(e) => setPatientWeight(Number.parseInt(e.target.value) || 70)}
                      placeholder="Enter weight in kg"
                    />
                  </div>

                  {/* Protocol Selection */}
                  <div className="space-y-2">
                    <Label>Emergency Protocol</Label>
                    <Select value={selectedProtocolId} onValueChange={setSelectedProtocolId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        {stabilizationProtocols.map((protocol) => (
                          <SelectItem key={protocol.id} value={protocol.id}>
                            <div className="flex items-center gap-2">
                              <Badge className={getTriageColor(protocol.urgency)} size="sm">
                                {protocol.urgency.toUpperCase()}
                              </Badge>
                              {protocol.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Protocol Details */}
                  {selectedProtocolId && (
                    <div className="space-y-3">
                      {(() => {
                        const protocol = stabilizationProtocols.find((p) => p.id === selectedProtocolId)
                        if (!protocol) return null

                        return (
                          <div className="border rounded-lg p-3 bg-slate-50">
                            <h4 className="font-medium mb-2">{protocol.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{protocol.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Steps: {protocol.steps.length}</span>
                              <span>Duration: ~{protocol.estimatedDuration}min</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* Start Protocol Button */}
                  <Button
                    onClick={() => selectedProtocolId && startProtocol(selectedProtocolId, patients[0]?.id || "1")}
                    disabled={!selectedProtocolId || !!activeProtocol}
                    className="w-full"
                  >
                    {activeProtocol ? "Protocol Active" : "Start Protocol"}
                  </Button>

                  {/* Active Protocol Status */}
                  {activeProtocol && (
                    <div className="border rounded-lg p-3 bg-emerald-50 border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-emerald-800">Protocol Active</span>
                      </div>
                      <div className="text-sm text-emerald-700">
                        <p>Started: {activeProtocol.startTime.toLocaleTimeString()}</p>
                        <p>
                          Step: {activeProtocol.currentStepIndex + 1} of{" "}
                          {stabilizationProtocols.find((p) => p.id === activeProtocol.protocolId)?.steps.length}
                        </p>
                        <p>Completed: {activeProtocol.completedSteps.length} steps</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Protocol Execution */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-emerald-600" />
                    Protocol Execution
                  </CardTitle>
                  <CardDescription>Step-by-step guidance with real-time monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  {!activeProtocol ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No Active Protocol</p>
                      <p>Select a protocol from the left panel to begin emergency stabilization</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {(() => {
                        const protocol = stabilizationProtocols.find((p) => p.id === activeProtocol.protocolId)
                        if (!protocol) return null

                        const currentStep = protocol.steps[activeProtocol.currentStepIndex]

                        return (
                          <>
                            {/* Current Step */}
                            <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-emerald-800">
                                  Step {activeProtocol.currentStepIndex + 1}: {currentStep.title}
                                </h3>
                                {currentStep.duration && (
                                  <div className="flex items-center gap-2">
                                    <Timer className="h-4 w-4 text-emerald-600" />
                                    <span className="text-lg font-mono text-emerald-700">
                                      {formatTime(activeProtocol.timeRemaining)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <p className="text-emerald-700 mb-4">{currentStep.description}</p>

                              {currentStep.criticalNote && (
                                <Alert className="mb-4 border-red-200 bg-red-50">
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                  <AlertDescription className="text-red-800">
                                    <strong>Critical:</strong> {currentStep.criticalNote}
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Checklist Items */}
                              {currentStep.checklistItems && (
                                <div className="space-y-2 mb-4">
                                  <h4 className="font-medium text-emerald-800">Checklist:</h4>
                                  {currentStep.checklistItems.map((item, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <Checkbox id={`check-${index}`} className="mt-1" />
                                      <Label htmlFor={`check-${index}`} className="text-sm text-emerald-700">
                                        {item}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Timer Controls */}
                              {currentStep.duration && (
                                <div className="flex items-center gap-2 mb-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={startStepTimer}
                                    disabled={activeProtocol.timerActive}
                                  >
                                    <Play className="h-4 w-4 mr-1" />
                                    Start
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={pauseStepTimer}
                                    disabled={!activeProtocol.timerActive}
                                  >
                                    <Pause className="h-4 w-4 mr-1" />
                                    Pause
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={resetStepTimer}>
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Reset
                                  </Button>
                                </div>
                              )}

                              {/* Step Actions */}
                              <div className="flex items-center gap-2">
                                <Button onClick={completeCurrentStep} className="bg-emerald-600 hover:bg-emerald-700">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete Step
                                </Button>
                                {activeProtocol.currentStepIndex < protocol.steps.length - 1 && (
                                  <Button variant="outline" onClick={advanceToNextStep}>
                                    Next Step
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Protocol Progress */}
                            <div className="space-y-3">
                              <h4 className="font-medium">Protocol Progress</h4>
                              <div className="space-y-2">
                                {protocol.steps.map((step, index) => (
                                  <div
                                    key={step.id}
                                    className={`flex items-center gap-3 p-2 rounded ${
                                      step.isCompleted
                                        ? "bg-emerald-100 text-emerald-800"
                                        : step.isActive
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    <div className="flex-shrink-0">
                                      {step.isCompleted ? (
                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                      ) : step.isActive ? (
                                        <Clock className="h-5 w-5 text-blue-600" />
                                      ) : (
                                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium">{step.title}</div>
                                      {step.duration && (
                                        <div className="text-xs opacity-75">{step.duration} minutes</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Medications */}
                            <div className="space-y-3">
                              <h4 className="font-medium flex items-center gap-2">
                                <Calculator className="h-4 w-4" />
                                Medications & Dosages
                              </h4>
                              <div className="grid grid-cols-1 gap-3">
                                {protocol.medications.map((med, index) => (
                                  <div key={index} className="border rounded-lg p-3 bg-blue-50">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium text-blue-800">{med.name}</h5>
                                      <Badge variant="outline" className="text-blue-700">
                                        {med.route}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                                      <div>
                                        <span className="font-medium">Dosage: </span>
                                        {calculateDosage(med, patientWeight)}
                                      </div>
                                      <div>
                                        <span className="font-medium">Frequency: </span>
                                        {med.frequency}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Vitals to Monitor */}
                            <div className="space-y-3">
                              <h4 className="font-medium">Vitals to Monitor</h4>
                              <div className="flex flex-wrap gap-2">
                                {protocol.vitalsToMonitor.map((vital, index) => (
                                  <Badge key={index} variant="outline" className="text-purple-700 border-purple-200">
                                    {vital}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ... existing code for other tab contents ... */}
        </Tabs>
      </main>
    </div>
  )
}
