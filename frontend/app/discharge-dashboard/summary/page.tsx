"use client"

import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ClipboardList, Download, Printer, Share2, FileText, 
  CheckCircle2, History, AlertCircle, Sparkles, QrCode,
  Table as TableIcon, Activity, Pill, ShieldCheck
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function SummaryPage() {
  const { user } = useAuth()
  const [generating, setGenerating] = useState(false)
  const [showSeal, setShowSeal] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState("Ready to sync with Medicare")
  const [syncDetails, setSyncDetails] = useState("")
  const patientId = user?.id ?? "PT-44221"
  const patientName = user?.name ?? "Rahul Sharma"
  const token = user?.token
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const handleSyncWithMedicare = async () => {
    setSyncing(true)
    setSyncStatus("Sending discharge data to Medicare...")
    setSyncDetails("")

    try {
      const response = await fetch(`${apiBase}/medicare/discharge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patient_id: patientId,
          patient_name: patientName,
          summary_version: "v2",
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Medicare sync failed")
      }

      setSyncing(false)
      setSyncStatus(result.status || "Medicare sync complete")
      setSyncDetails(result.detail || "The summary has been forwarded and approved.")

      toast.success("Medicare discharge synced", {
        description: result.detail || "Discharge data shared with Medicare.",
      })
    } catch (error) {
      setSyncing(false)
      setSyncStatus("Medicare sync failed")
      setSyncDetails("Please try again or contact support.")
      toast.error("Unable to sync with Medicare", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      toast.success("Insights Regenerated", {
        description: "AI analysis has been updated with latest patient data.",
      })
    }, 2500)
  }

  const handleShare = () => {
    toast.info("Secure Link Copied", {
      description: "You can now share this document via encrypted link.",
    })
  }

  const handlePrint = () => {
    toast.info("Preparing for Print", {
      description: "Optimizing document for A4 layout...",
    })
  }

  const handleDownload = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Generating PDF...',
        success: 'Discharge_Summary.pdf downloaded!',
        error: 'Error generating PDF.',
      }
    )
  }

  const handleCourier = () => {
    toast.success("Courier Requested", {
      description: "A hard copy will be delivered to your registered address in 2-3 business days.",
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
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Discharge Summary</h1>
          <p className="text-muted-foreground font-medium">Certified clinical overview and instructions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-11 border-slate-200 dark:border-slate-800" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2 text-primary" />
            Share
          </Button>
          <Button variant="outline" className="rounded-2xl h-11 border-slate-200 dark:border-slate-800" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2 text-primary" />
            Print
          </Button>
          <Button className="rounded-2xl h-11 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate AI Insights
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            className="rounded-2xl h-11 shadow-lg shadow-primary/10"
            onClick={handleSyncWithMedicare}
            disabled={syncing}
          >
            {syncing ? "Syncing Medicare..." : "Send to Medicare"}
          </Button>
        </div>
      </motion.div>

      <div className="rounded-3xl border border-slate-200/80 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-700 dark:text-slate-300 mb-6">
        <p className="font-semibold">Medicare discharge status</p>
        <p className="mt-1">{syncStatus}</p>
        {syncDetails ? <p className="mt-1 text-xs text-muted-foreground">{syncDetails}</p> : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Document Preview */}
        <Card className="lg:col-span-3 min-h-[900px] flex flex-col border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden relative">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Clinical_Summary_v2.pdf</CardTitle>
                  <CardDescription className="font-medium">Verified by Dr. Amit Verma • 2:45 PM Today</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={handleDownload}>
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 bg-white dark:bg-slate-950 overflow-hidden relative shadow-inner">
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 space-y-8"
                >
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                    </div>
                    <p className="text-primary font-medium animate-pulse">Our AI is generating clinical insights...</p>
                  </div>
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-32 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 lg:p-12 font-serif text-slate-800 dark:text-slate-200 leading-relaxed"
                >
                  {/* PDF Content Mockup */}
                  <div className="max-w-3xl mx-auto space-y-10">
                    {/* Hospital Header */}
                    <div className="flex justify-between items-start border-b-2 border-primary/20 pb-8">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-primary tracking-tight">AI CHIKITSALAYA</h2>
                        <p className="text-sm font-sans font-medium">Global Healthcare Excellence</p>
                        <p className="text-[11px] font-sans text-muted-foreground">123 Health Ave, Medical District • +91 1800-MED-AI</p>
                      </div>
                      <div className="text-right space-y-1 font-sans">
                        <Badge variant="outline" className="mb-2 border-primary/30 text-primary">Certified Digital Record</Badge>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Document ID</p>
                        <p className="text-xs font-mono">HASH-77a8-221c-990b</p>
                      </div>
                    </div>
                    
                    {/* Patient Info Grid */}
                    <div className="grid grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl font-sans text-sm">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Patient Name</p>
                        <p className="font-bold">Rahul Sharma</p>
                        <p className="text-xs text-muted-foreground">Male • 29 Years</p>
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Admission</p>
                        <p className="font-semibold">01 May 2026</p>
                        <p className="text-[10px] text-muted-foreground">IPD No: #AI-9902</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Discharge</p>
                        <p className="font-semibold">07 May 2026</p>
                        <p className="text-[10px] text-muted-foreground text-primary font-bold">STABLE</p>
                      </div>
                    </div>

                    {/* Clinical Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white border-l-4 border-primary pl-3">
                        Clinical Diagnosis & Summary
                      </h3>
                      <p className="text-sm">
                        Patient was admitted with complaints of persistent non-productive cough and high-grade fever. 
                        Clinical investigation confirmed <strong>Acute Bronchitis</strong> with secondary bacterial involvement. 
                        Lung auscultation revealed bilateral rhonchi. Initial O2 saturation was 94% on room air.
                      </p>
                    </div>

                    {/* Lab Results Table */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white border-l-4 border-primary pl-3">
                        Key Lab Investigations
                      </h3>
                      <div className="border rounded-lg overflow-hidden font-sans">
                        <Table>
                          <TableHeader className="bg-slate-50 dark:bg-slate-900">
                            <TableRow>
                              <TableHead className="text-[11px] uppercase font-bold">Parameter</TableHead>
                              <TableHead className="text-[11px] uppercase font-bold">Admission</TableHead>
                              <TableHead className="text-[11px] uppercase font-bold">Discharge</TableHead>
                              <TableHead className="text-[11px] uppercase font-bold">Reference</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="text-xs">
                            <TableRow>
                              <TableCell className="font-medium">WBC Count</TableCell>
                              <TableCell className="text-destructive font-bold">14,500</TableCell>
                              <TableCell className="text-success font-bold">8,200</TableCell>
                              <TableCell>4k - 11k</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">CRP (Reactive)</TableCell>
                              <TableCell className="text-destructive font-bold">48.2</TableCell>
                              <TableCell className="text-success font-bold">4.1</TableCell>
                              <TableCell>{'< 5.0'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">O2 Saturation</TableCell>
                              <TableCell>94%</TableCell>
                              <TableCell className="text-success font-bold">99%</TableCell>
                              <TableCell>{'> 95%'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Medication Reconcilliation */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white border-l-4 border-primary pl-3">
                        Discharge Medications
                      </h3>
                      <div className="grid gap-3 font-sans">
                        {[
                          { name: "Tab. Amoxicillin 500mg", dose: "1-1-1", duration: "5 Days", instruction: "After Food" },
                          { name: "Syr. Ascoril 10ml", dose: "1-0-1", duration: "3 Days", instruction: "Warm water recommended" },
                          { name: "Tab. Paracetamol 650mg", dose: "SOS", duration: "As needed", instruction: "If fever > 100°F" },
                        ].map((med, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/30">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Pill className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{med.name}</p>
                                <p className="text-[10px] text-muted-foreground">{med.instruction}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold">{med.dose}</p>
                              <p className="text-[10px] text-muted-foreground">{med.duration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Follow-up instructions */}
                    <div className="bg-primary/5 p-6 rounded-xl space-y-3 font-sans border border-primary/10">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Follow-up Instructions
                      </h4>
                      <ul className="text-xs space-y-2 list-disc pl-5 opacity-90">
                        <li>Maintain high fluid intake (2.5L - 3L daily).</li>
                        <li>Avoid strenuous physical activity for the next 48 hours.</li>
                        <li>Consult immediately if chest pain or hemoptysis occurs.</li>
                        <li>Review with Dr. Amit Verma on 14th May at 10:30 AM.</li>
                      </ul>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="pt-16 flex justify-between items-end">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <img 
                            src="https://api.dicebear.com/7.x/initials/svg?seed=AV&backgroundColor=transparent&fontFamily=Brush%20Script%20MT" 
                            className="h-12 opacity-50 absolute -top-8 left-1/2 -translate-x-1/2"
                            alt="Signature"
                          />
                          <div className="h-[1px] bg-slate-300 w-40" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold">DR. AMIT VERMA</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Attending Consultant • MD Medicine</p>
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-white border p-1 rounded-lg mx-auto shadow-sm">
                          <QrCode className="w-full h-full text-slate-800" />
                        </div>
                        <p className="text-[8px] text-muted-foreground uppercase font-bold">Scan to Verify Record</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Watermark Seal */}
            {showSeal && !generating && (
              <motion.div 
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 100 }}
                className="absolute top-20 right-20 pointer-events-none"
              >
                <div className="w-32 h-32 rounded-full border-[6px] border-primary/20 flex items-center justify-center rotate-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                  <div className="text-center text-primary font-bold z-10 leading-tight">
                    <p className="text-[10px] uppercase">DIGITALLY</p>
                    <p className="text-lg">SIGNED</p>
                    <div className="h-[1px] bg-primary/30 my-1 mx-2" />
                    <p className="text-[8px]">AI CHIKITSALAYA</p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden group">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Security & Trust
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Digital Signature</span>
                <Badge variant="outline" className="h-5 px-2 bg-green-500/10 text-green-600 border-none font-black text-[9px] uppercase tracking-widest">
                  VERIFIED
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">HIPAA Compliant</span>
                <Badge variant="outline" className="h-5 px-2 bg-indigo-500/10 text-indigo-600 border-none font-black text-[9px] uppercase tracking-widest">YES</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Blockchain ID</span>
                <code className="text-[10px] font-mono text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg truncate w-24">0x4f...9c2a</code>
              </div>
              
              <div className="pt-4 space-y-4">
                <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2">Activity Log</p>
                <div className="space-y-4">
                  {[
                    { title: "Final Review", user: "Dr. Amit Verma", time: "2:45 PM" },
                    { title: "Draft Generated", user: "AI Assistant", time: "2:30 PM" },
                    { title: "Data Synced", user: "HMS Core", time: "2:15 PM" },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                      <div>
                        <p className="text-[10px] font-black leading-none text-slate-900 dark:text-white uppercase tracking-tight">{log.title}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{log.user} • {log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-20 h-20" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-indigo-300">
                <Sparkles className="w-4 h-4" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] font-medium leading-relaxed text-slate-400 italic">
                "Based on your CRP drop from 48.2 to 4.1, your body has responded exceptionally well to the treatment. Recovery is estimated at 95%."
              </p>
              <Button 
                variant="outline" 
                className="w-full rounded-2xl border-slate-700 text-white hover:bg-slate-800 h-10 font-bold text-[10px] uppercase tracking-wider"
                onClick={() => toast.info("Opening AI Chat...")}
              >
                ASK AI QUESTIONS
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Need a physical copy?</p>
            <Button variant="ghost" className="w-full rounded-2xl h-11 font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={handleCourier}>
              REQUEST EXPRESS COURIER
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
