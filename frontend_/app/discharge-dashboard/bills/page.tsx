"use client"

import { motion } from "framer-motion"
import { Receipt, CreditCard, Download, ExternalLink, ShieldCheck, History, ArrowRight, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const currentBill = {
  id: "INV-2026-001",
  date: "May 06, 2026",
  dueDate: "May 13, 2026",
  patient: "Rahul Sharma",
  hospital: "City Medical Center",
  items: [
    { name: "Consultation Fee", amount: 1500 },
    { name: "Diagnostic Tests (Blood & X-Ray)", amount: 3500 },
    { name: "Pharmacy Charges", amount: 1200 },
    { name: "Room Charges (2 Days)", amount: 8000 },
    { name: "Nursing & Services", amount: 2000 },
  ],
  total: 16200,
  tax: 810,
  insuranceCoverage: 12000,
  netPayable: 5010,
  status: "Pending",
}

const paymentHistory = [
  { id: "PAY-998", date: "April 15, 2026", amount: 2500, method: "UPI", status: "Successful" },
  { id: "PAY-997", date: "March 20, 2026", amount: 5000, method: "Credit Card", status: "Successful" },
]

export default function BillsPage() {
  const handlePayment = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2500)),
      {
        loading: 'Processing secure payment...',
        success: 'Payment successful! Invoice updated.',
        error: 'Payment failed. Please try again.',
      }
    )
  }

  const handleDownload = () => {
    toast.success("Invoice downloaded", {
      description: "INV-2026-001.pdf is now available in your downloads.",
    })
  }

  const handleAddMethod = () => {
    toast.info("Add Payment Method", {
      description: "Redirecting to secure gateway...",
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
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Billing & Invoices</h1>
          <p className="text-muted-foreground font-medium">Manage your hospital expenses and insurance claims</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-11 border-slate-200 dark:border-slate-800" onClick={() => toast("Payment methods", { description: "Manage your saved cards and UPI IDs." })}>
            <CreditCard className="w-4 h-4 mr-2 text-primary" />
            Methods
          </Button>
          <Button className="rounded-2xl h-11 shadow-lg shadow-primary/20" onClick={() => toast.success("Downloading all invoices...")}>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-8 pt-10 px-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Balance Due</p>
                  <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">₹{currentBill.netPayable.toLocaleString()}.00</h3>
                </div>
                <div className="flex gap-2">
                  <Button size="lg" className="rounded-2xl h-14 px-8 bg-primary text-white shadow-xl shadow-primary/30 group/btn" onClick={handlePayment}>
                    PAY NOW
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 mb-8">
                {[
                  { label: "Patient", val: currentBill.patient },
                  { label: "Due Date", val: currentBill.dueDate },
                  { label: "Invoice #", val: currentBill.id },
                  { label: "Status", val: currentBill.status, accent: true },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.label}</p>
                    <p className={cn("text-sm font-bold", item.accent ? "text-primary" : "text-slate-900 dark:text-slate-100")}>{item.val}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white px-1">
                  <Receipt className="w-4 h-4 text-primary" />
                  Service Breakdown
                </h3>
                <div className="grid gap-3">
                  {currentBill.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:border-primary/20 transition-colors shadow-sm">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold">Saved Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-primary/20 cursor-pointer transition-all hover:shadow-md group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-slate-900 dark:text-white">Visa •••• 4242</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Expires 12/28</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
              </div>
              <Button variant="ghost" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-primary h-10 hover:bg-primary/5" onClick={handleAddMethod}>
                + Add New Method
              </Button>
            </CardContent>
          </Card>

          {/* Insurance Alert */}
          <Card className="border-none shadow-xl bg-slate-900 text-white rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="w-20 h-20" />
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                TPA Approval Verified
              </div>
              <p className="text-xs font-medium text-slate-400 leading-relaxed">
                Your insurance provider (Star Health) has approved 74% of the bill amount. The remaining ₹{currentBill.netPayable.toLocaleString()} is your co-pay balance.
              </p>
              <Button variant="outline" className="w-full rounded-xl border-slate-700 text-white hover:bg-slate-800 h-10 font-bold text-[10px] uppercase tracking-wider">
                VIEW TPA LETTER <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
