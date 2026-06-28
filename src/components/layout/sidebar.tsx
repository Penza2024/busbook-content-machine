"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import { useProjects } from "@/hooks/use-projects"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LayoutDashboard,
  Lightbulb,
  Repeat2,
  Calendar,
  BarChart3,
  Settings,
  Layers,
  LogOut,
  Sun,
  Moon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/series", label: "Series", icon: Layers },
  { href: "/multiplier", label: "Multiplier", icon: Repeat2 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const { projects, defaultProject } = useProjects()
  const { setTheme, resolvedTheme } = useTheme()
  const [activeProjectId, setActiveProjectId] = useState<string>(
    typeof window !== "undefined" ? localStorage.getItem("activeProjectId") ?? defaultProject?.id ?? "" : ""
  )

  function handleProjectChange(id: string) {
    setActiveProjectId(id)
    localStorage.setItem("activeProjectId", id)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <aside className="hidden md:flex md:w-60 flex-col border-r bg-background">
      <div className="p-4 space-y-3">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="h-7 w-7 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">BC</div>
          <span className="font-bold text-base">Content OS</span>
        </Link>
        {projects.length > 0 && (
          <Select value={activeProjectId || defaultProject?.id} onValueChange={handleProjectChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <Separator />
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button
              variant={pathname === href || pathname.startsWith(href + "/") ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-2", pathname === href && "font-medium")}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          </Link>
        ))}
      </nav>
      <Separator />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 px-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">{user?.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate flex-1">{user?.email ?? "Not signed in"}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50 flex">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={cn(
          "flex-1 flex flex-col items-center py-2 text-xs",
          pathname === href ? "text-primary" : "text-muted-foreground"
        )}>
          <Icon className="h-5 w-5 mb-0.5" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
