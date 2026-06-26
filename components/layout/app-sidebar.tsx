'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import {
  BookOpen,
  Building2,
  CalendarDays,
  ChevronUp,
  Clock,
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  School,
  Settings,
  Users,
} from 'lucide-react'
import type { UserRole } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const adminNav: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    group: 'Resources',
    items: [
      { label: 'Faculties', href: '/admin/faculties', icon: School },
      { label: 'Departments', href: '/admin/departments', icon: Building2 },
      { label: 'Courses', href: '/admin/courses', icon: BookOpen },
      { label: 'Lecturers', href: '/admin/lecturers', icon: Users },
      { label: 'Rooms', href: '/admin/rooms', icon: DoorOpen },
      { label: 'Time Slots', href: '/admin/timeslots', icon: Clock },
    ],
  },
  {
    group: 'Scheduling',
    items: [
      { label: 'Run Scheduler', href: '/admin/scheduler', icon: CalendarDays },
      { label: 'Constraints', href: '/admin/constraints', icon: Settings },
    ],
  },
  {
    group: 'Timetable',
    items: [{ label: 'View & Publish', href: '/admin/timetable', icon: CalendarDays }],
  },
]

const lecturerNav: { group: string; items: NavItem[] }[] = [
  {
    group: 'My Timetable',
    items: [
      { label: 'My Schedule', href: '/lecturer', icon: CalendarDays },
      { label: 'Unavailability', href: '/lecturer/unavailability', icon: Clock },
    ],
  },
]

const studentNav: { group: string; items: NavItem[] }[] = [
  {
    group: 'My Timetable',
    items: [{ label: 'Timetable', href: '/student', icon: CalendarDays }],
  },
]

function navForRole(role: UserRole) {
  if (role === 'admin') return adminNav
  if (role === 'lecturer') return lecturerNav
  return studentNav
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const nav = navForRole(user.role)
  const initials = user.email.slice(0, 2).toUpperCase()

  return (
    <Sidebar>
      <SidebarHeader className="py-4">
        <div className="flex items-center gap-2 px-2">
          <GraduationCap className="size-6 text-primary shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">CSET Timetable</span>
            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {nav.map(({ group, items }) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{group}</SidebarGroupLabel>
            <SidebarMenu>
              {items.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href}>
                    <Link href={href}>
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-full">
              <Avatar className="size-6">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-left text-sm">{user.email}</span>
              <ChevronUp className="size-4 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
