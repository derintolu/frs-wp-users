import * as React from "react"
import {
  User,
  Globe,
  MapPin,
  FileText,
  CheckSquare,
  Shield,
  ArrowLeft,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface ProfileEditorSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection: string | null
  onSectionChange: (section: string | null) => void
  children?: React.ReactNode
}

const navItems = [
  {
    title: "Contact Details",
    key: "profile",
    icon: User,
  },
  {
    title: "Links & Social",
    key: "links",
    icon: Globe,
  },
  {
    title: "Service Areas",
    key: "service-areas",
    icon: MapPin,
  },
  {
    title: "Biography",
    key: "biography",
    icon: FileText,
  },
  {
    title: "Specialties",
    key: "specialties",
    icon: CheckSquare,
  },
  {
    title: "Certifications",
    key: "certifications",
    icon: Shield,
  },
]

export function ProfileEditorSidebar({
  activeSection,
  onSectionChange,
  children,
  ...props
}: ProfileEditorSidebarProps) {
  const currentSection = navItems.find(item => item.key === activeSection)

  return (
    <Sidebar variant="inset" collapsible="none" className="bg-white border-r border-gray-200" {...props}>
      <div className="relative h-full overflow-hidden">
        {/* Form content - slides in from right when active */}
        <div
          className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            activeSection ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <SidebarHeader className="border-b px-6 py-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSectionChange(null)}
              className="w-full justify-start hover:bg-gray-100 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sections
            </Button>
            {currentSection && (
              <div className="mt-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <currentSection.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{currentSection.title}</h2>
              </div>
            )}
          </SidebarHeader>
          <SidebarContent className="px-6 py-6 h-[calc(100%-5rem)] overflow-y-auto">
            {children}
          </SidebarContent>
        </div>

        {/* Navigation menu - slides out to left when form active */}
        <div
          className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            activeSection ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <SidebarContent className="px-6 py-8">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-6 px-0">Profile Sections</SidebarGroupLabel>
              <SidebarMenu className="gap-2">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      size="lg"
                      onClick={() => onSectionChange(item.key)}
                      className="justify-start"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </div>
      </div>
    </Sidebar>
  )
}
