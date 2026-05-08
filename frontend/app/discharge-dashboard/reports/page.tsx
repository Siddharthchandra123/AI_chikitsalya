"use client"

import { motion } from "framer-motion"
import { FileText, Download, Eye, Clock, CheckCircle2, AlertCircle, Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const reports = [
  {
    id: "REP-001",
    name: "Blood Analysis Report",
    date: "May 05, 2026",
    category: "Pathology",
    status: "Verified",
    size: "1.2 MB",
  },
  {
    id: "REP-002",
    name: "Chest X-Ray Digital",
    date: "May 04, 2026",
    category: "Radiology",
    status: "Pending",
    size: "4.5 MB",
  },
  {
    id: "REP-003",
    name: "ECG Summary",
    date: "May 03, 2026",
    category: "Cardiology",
    status: "Verified",
    size: "0.8 MB",
  },
  {
    id: "REP-004",
    name: "Urinalysis Results",
    date: "May 02, 2026",
    category: "Pathology",
    status: "Verified",
    size: "1.1 MB",
  },
  {
    id: "REP-005",
    name: "MRA Brain Scan",
    date: "April 28, 2026",
    category: "Neurology",
    status: "Verified",
    size: "15.4 MB",
  },
]

export default function ReportsPage() {
  const handleDownload = (name: string) => {
    toast.success(`Starting download: ${name}`, {
      description: "Your document will be ready in a few seconds.",
    })
  }

  const handleView = (name: string) => {
    toast.info(`Opening preview: ${name}`, {
      description: "Loading high-resolution document viewer...",
    })
  }

  const handleDownloadAll = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Preparing all reports for download...',
        success: 'All reports bundled and downloaded!',
        error: 'Error bundling reports.',
      }
    )
  }

  return (
    <main className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Medical Reports</h1>
          <p className="text-muted-foreground font-medium">Manage and export your clinical diagnostic data</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-11 border-slate-200 dark:border-slate-800" onClick={() => toast("Filter applied", { description: "Showing all pathology reports." })}>
            <Filter className="w-4 h-4 mr-2 text-primary" />
            Filter
          </Button>
          <Button className="rounded-2xl h-11 shadow-lg shadow-primary/20" onClick={handleDownloadAll}>
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6">
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by report name, date or doctor..." 
            className="pl-11 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-visible:ring-primary/20"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="grid gap-4">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 to-indigo-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none font-bold text-[10px] uppercase tracking-wider">
                    {report.category}
                  </Badge>
                </div>
                
                <div className="space-y-1 mb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{report.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>{report.date}</span>
                    <span>•</span>
                    <span>{report.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl h-10 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs"
                    onClick={() => handleView(report.id, report.name)}
                  >
                    <Eye className="w-3 h-3 mr-2" />
                    VIEW
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl h-10 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold text-xs"
                    onClick={() => handleDownload(report.id, report.name)}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    GET PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* No Reports Empty State (Mockup) */}
      {reports.length === 0 && (
        <Card className="p-12 text-center bg-muted/20 border-dashed">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No reports found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </Card>
      )}
    </main>
  )
}
