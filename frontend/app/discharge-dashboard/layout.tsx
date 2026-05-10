"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"
import { AIAssistant } from "@/components/dashboard/ai-assistant"
import { UploadModal } from "@/components/dashboard/upload-modal"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export default function DischargeDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname === "/discharge-dashboard/login") {
      return
    }

    if (!isAuthenticated) {
      router.replace("/discharge-dashboard/login")
    }
  }, [isAuthenticated, pathname, router])

  useEffect(() => {
    if (pathname === "/discharge-dashboard/login" && isAuthenticated) {
      router.replace("/discharge-dashboard")
    }
  }, [isAuthenticated, pathname, router])

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Main Content Area */}
        <div
          className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            sidebarCollapsed ? "ml-24" : "ml-[300px]"
          )}
        >
          <Navbar />
          <div className="flex-1 overflow-y-auto bg-background">
            {children}
          </div>
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* AI Assistant */}
        <AIAssistant
          isOpen={aiAssistantOpen}
          onToggle={() => setAiAssistantOpen(!aiAssistantOpen)}
        />

        {/* Upload Modal */}
        <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
      </div>
    </div>
  )
}
