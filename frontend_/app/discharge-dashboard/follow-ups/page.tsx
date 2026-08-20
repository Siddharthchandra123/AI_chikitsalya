"use client"

import { motion } from "framer-motion"
import { CalendarClock, Video, MapPin, Bell, Calendar as CalendarIcon, CheckCircle2, Plus, PhoneCall, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const appointments = [
  {
    id: "APP-001",
    doctor: "Dr. Amit Verma",
    specialty: "Pulmonology",
    date: "May 14, 2026",
    time: "10:30 AM",
    type: "In-Person",
    location: "Clinic A, Floor 2",
    status: "Confirmed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dr-amit",
  },
  {
    id: "APP-002",
    doctor: "Dr. Sarah Johnson",
    specialty: "General Physician",
    date: "May 21, 2026",
    time: "03:00 PM",
    type: "Tele-consult",
    location: "Virtual Link",
    status: "Upcoming",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dr-sarah",
  },
]

export default function FollowUpsPage() {
  const handleSchedule = () => {
    toast.info("Opening Scheduler", {
      description: "Fetching available slots for Dr. Amit Verma...",
    })
  }

  const handleReschedule = (id: string) => {
    toast.info(`Rescheduling ${id}`, {
      description: "Please select a new date and time.",
    })
  }

  const handleJoin = (id: string) => {
    toast.success("Joining Consultation", {
      description: "Please ensure your camera and microphone are enabled.",
    })
  }

  const handleEmergency = () => {
    toast.error("EMERGENCY PROTOCOL ACTIVATED", {
      description: "Dispatching nearest ambulance and notifying ER. Please stay on the line.",
      duration: 10000,
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
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Follow-up Care</h1>
          <p className="text-muted-foreground font-medium">Schedule and manage your post-discharge appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="destructive" className="rounded-2xl h-11 shadow-lg shadow-destructive/20" onClick={handleEmergency}>
            <PhoneCall className="w-4 h-4 mr-2" />
            SOS Emergency
          </Button>
          <Button className="rounded-2xl h-11 shadow-lg shadow-primary/20" onClick={handleSchedule}>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 px-1">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Scheduled Visits
          </h3>
          
          <div className="grid gap-6">
            {appointments.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative">
                  <div className={cn(
                    "absolute top-0 left-0 w-full h-1.5",
                    app.type === "In-Person" ? "bg-indigo-500" : "bg-teal-500"
                  )} />
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <Avatar className="w-20 h-20 border-4 border-slate-50 dark:border-slate-800 shadow-xl group-hover:scale-105 transition-transform">
                          <AvatarImage src={app.avatar} />
                          <AvatarFallback className="font-black text-xl">{app.doctor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{app.doctor}</h4>
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none uppercase font-bold text-[9px] px-2">{app.status}</Badge>
                          </div>
                          <p className="text-primary font-bold text-sm uppercase tracking-widest">{app.specialty}</p>
                          <div className="flex flex-wrap items-center gap-5 mt-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm">
                              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{app.date}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm">
                              <CalendarClock className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{app.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center sm:items-end gap-4 min-w-[200px]">
                        <div className="text-right flex flex-col items-center sm:items-end gap-3">
                          <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest",
                            app.type === "In-Person" ? "bg-indigo-500/10 text-indigo-600" : "bg-teal-500/10 text-teal-600"
                          )}>
                            {app.type === "In-Person" ? <MapPin className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            {app.type}
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight max-w-[150px] text-center sm:text-right">{app.location}</p>
                        </div>
                        <div className="flex gap-2 w-full">
                          <Button variant="outline" className="flex-1 rounded-2xl font-black text-[10px] h-11 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => handleReschedule(app.id)}>
                            RESCHEDULE
                          </Button>
                          <Button className="flex-1 rounded-2xl font-black text-[10px] h-11 bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90" onClick={() => handleJoin(app.id)}>
                            {app.type === "In-Person" ? "VIEW MAP" : "JOIN CALL"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reminders & Info */}
        <div className="space-y-8">
          <Card className="border-none shadow-2xl bg-gradient-to-br from-indigo-600 to-primary text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Bell className="w-40 h-40" />
            </div>
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="text-xl font-black tracking-tight">Health Notifications</CardTitle>
              <CardDescription className="text-white/60 font-medium">Critical updates for your recovery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {[
                { title: "Check-up in 7 days", desc: "Lung function test scheduled at CMC Main Branch.", icon: CheckCircle2 },
                { title: "Next Refill: May 12", desc: "Request refill for Lisinopril before next Tuesday.", icon: CalendarClock },
              ].map((note, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex gap-4 items-start group/note hover:bg-white/15 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 group-hover/note:scale-110 transition-transform">
                    <note.icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black uppercase tracking-tight">{note.title}</p>
                    <p className="text-[10px] font-medium text-white/70 leading-relaxed">{note.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Emergency Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                If you experience severe chest pain, extreme difficulty breathing, or high fever over 103°F, use the immediate response system.
              </p>
              <Button variant="destructive" className="w-full h-16 rounded-3xl font-black text-lg shadow-2xl shadow-destructive/30 uppercase tracking-[0.1em] group" onClick={handleEmergency}>
                <PhoneCall className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                ACTIVATE SOS
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
