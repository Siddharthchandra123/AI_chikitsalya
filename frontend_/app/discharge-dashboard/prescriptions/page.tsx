"use client"

import { motion } from "framer-motion"
import { Pill, Clock, AlertCircle, Info, Calendar, Bell, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const activePrescriptions = [
  {
    id: "MED-001",
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times a day",
    duration: "7 Days",
    started: "May 01, 2026",
    ends: "May 08, 2026",
    instructions: "Take with food",
    status: "Active",
  },
  {
    id: "MED-002",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "Ongoing",
    started: "Jan 15, 2026",
    ends: "Continuous",
    instructions: "Take in the morning",
    status: "Active",
  },
  {
    id: "MED-003",
    name: "Metformin",
    dosage: "850mg",
    frequency: "Twice daily",
    duration: "Ongoing",
    started: "Feb 10, 2026",
    ends: "Continuous",
    instructions: "Take with meals",
    status: "Active",
  },
]

const pastPrescriptions = [
  {
    id: "MED-004",
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "As needed",
    duration: "3 Days",
    started: "April 15, 2026",
    ends: "April 18, 2026",
    instructions: "For pain relief",
    status: "Completed",
  },
]

export default function PrescriptionsPage() {
  const handleRefill = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Sending refill request to pharmacy...',
        success: 'Refill request sent! You will be notified once approved.',
        error: 'Failed to send refill request.',
      }
    )
  }

  const handleDetails = (name: string) => {
    toast.info(`Medication Info: ${name}`, {
      description: "Detailed dosage and interaction information loading...",
    })
  }

  const handleReorder = (name: string) => {
    toast.success(`Added ${name} to cart`, {
      description: "Redirecting to pharmacy for checkout...",
    })
  }

  return (
    <main className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Prescriptions</h1>
          <p className="text-muted-foreground font-medium">Active medications and refill schedule</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-11 border-slate-200 dark:border-slate-800" onClick={() => toast("Refill reminder set", { description: "You will be notified 2 days before medication ends." })}>
            <Bell className="w-4 h-4 mr-2 text-primary" />
            Remind Me
          </Button>
          <Button className="rounded-2xl h-11 shadow-lg shadow-primary/20" onClick={() => toast.success("Refill request sent to pharmacy")}>
            <Pill className="w-4 h-4 mr-2" />
            Order All Refills
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="active">Active Medications</TabsTrigger>
          <TabsTrigger value="history">Past Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePrescriptions.map((med, index) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500/60" />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300">
                        <Pill className="w-6 h-6" />
                      </div>
                      <Badge variant="secondary" className="rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none font-bold text-[10px] uppercase tracking-wider">
                        {med.dosage}
                      </Badge>
                    </div>
                    <div className="space-y-4 mb-8">
                      <div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{med.name}</h3>
                        <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">{med.frequency}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Course</p>
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white">{med.duration}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Ends</p>
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white">{med.ends}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-primary/5 border border-primary/10">
                        <Info className="w-3 h-3 text-primary shrink-0" />
                        <span className="text-[10px] font-bold text-primary italic">{med.instructions}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl h-10 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs"
                        onClick={() => handleDetails(med.name)}
                      >
                        DETAILS
                      </Button>
                      <Button
                        className="flex-1 rounded-xl h-10 bg-primary text-white hover:bg-primary/90 font-bold text-xs shadow-lg shadow-primary/20"
                        onClick={() => handleReorder(med.name)}
                      >
                        REORDER
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pastPrescriptions.map((med) => (
                  <div key={med.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{med.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                          {med.dosage} • Ended {med.ends}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-xl font-black text-[10px] h-9 border-slate-100 dark:border-slate-800" onClick={() => handleReorder(med.name)}>REORDER</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reminder Banner */}
      <Card className="border-none shadow-xl bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white">Complete Your Amoxicillin Course</h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Even if you feel better, finish the full 7-day course to ensure the infection is completely cleared.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
