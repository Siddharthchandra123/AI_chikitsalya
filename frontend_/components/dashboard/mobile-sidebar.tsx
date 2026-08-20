"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FileText,
  Pill,
  Receipt,
  Shield,
  ClipboardList,
  CalendarClock,
  Settings,
  X,
  Heart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FileText, label: "Reports", active: false },
  { icon: Pill, label: "Prescriptions", active: false },
  { icon: Receipt, label: "Bills", active: false },
  { icon: Shield, label: "Insurance", active: false },
  { icon: ClipboardList, label: "Discharge Summary", active: false },
  { icon: CalendarClock, label: "Follow Ups", active: false },
  { icon: Settings, label: "Settings", active: false },
]

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-screen w-72 bg-sidebar border-r border-sidebar-border flex flex-col z-50 lg:hidden"
          >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-sidebar-foreground">
                    AI Chikitsalaya
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Healthcare Portal
                  </p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={onClose}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent group",
                    item.active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-sidebar-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      item.active
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
