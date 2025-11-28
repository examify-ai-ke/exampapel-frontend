'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { USER_ROLES, STORAGE_KEYS } from '@/lib/constants';
import { storage } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  FileText,
  Building,
  ChevronLeft,
  ChevronRight,
  Home,
  Search,
  Plus,
  GraduationCap,
  LogOut,
  User,
  Bell,
  Menu,
  X,
  Shield,
  Edit,
  FolderOpen,
  Archive,
  TrendingUp,
  Database,
  Book,
  School,
  MapPin,
  HelpCircle,
  CheckCircle,
  Upload,
  Library,
  Layers
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  children?: Omit<NavItem, 'children'>[];
}

const navItems: NavItem[] = [
  // Main Navigation
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  
  // Content Management (Primary)
  {
    title: 'Exam Papers',
    href: '/dashboard/exam-papers',
    icon: BookOpen,
    children: [
      {
        title: 'Browse All',
        href: '/dashboard/exam-papers',
        icon: Search,
      },
      {
        title: 'Recent',
        href: '/dashboard/exam-papers/recent',
        icon: TrendingUp,
      },
      {
        title: 'Create New',
        href: '/dashboard/exam-papers/create',
        icon: Plus,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Manage',
        href: '/dashboard/exam-papers/manage',
        icon: Settings,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Drafts',
        href: '/dashboard/exam-papers/drafts',
        icon: Edit,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Archived',
        href: '/dashboard/exam-papers/archived',
        icon: Archive,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
    ],
  },
  {
    title: 'Questions',
    href: '/dashboard/questions',
    icon: HelpCircle,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    children: [
      {
        title: 'Browse All',
        href: '/dashboard/questions',
        icon: Search,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Manage',
        href: '/dashboard/questions/manage',
        icon: Settings,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Question Sets',
        href: '/dashboard/questions/sets',
        icon: FolderOpen,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Answers',
        href: '/dashboard/questions/answers',
        icon: CheckCircle,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Import',
        href: '/dashboard/questions/import',
        icon: Upload,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
    ],
  },

  // Academic Structure
  {
    title: 'Institutions',
    href: '/dashboard/institutions',
    icon: Building,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    children: [
      {
        title: 'Overview',
        href: '/dashboard/institutions',
        icon: LayoutDashboard,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Faculties',
        href: '/dashboard/institutions/faculties',
        icon: School,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Departments',
        href: '/dashboard/institutions/departments',
        icon: Book,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Programmes',
        href: '/dashboard/institutions/programmes',
        icon: Layers,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Courses',
        href: '/dashboard/institutions/courses',
        icon: GraduationCap,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
      {
        title: 'Modules',
        href: '/dashboard/institutions/modules',
        icon: Library,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      },
    ],
  },

  // Personal
  {
    title: 'My Progress',
    href: '/dashboard/progress',
    icon: TrendingUp,
  },

  // Administration (Bottom)
  {
    title: 'Administration',
    href: '/dashboard/admin',
    icon: Shield,
    roles: [USER_ROLES.ADMIN],
    children: [
      {
        title: 'Overview',
        href: '/dashboard/admin',
        icon: LayoutDashboard,
        roles: [USER_ROLES.ADMIN],
      },
      {
        title: 'Users',
        href: '/dashboard/admin/users',
        icon: Users,
        roles: [USER_ROLES.ADMIN],
      },
      {
        title: 'Roles',
        href: '/dashboard/admin/roles',
        icon: Shield,
        roles: [USER_ROLES.ADMIN],
      },
      {
        title: 'Analytics',
        href: '/dashboard/admin/analytics',
        icon: BarChart3,
        roles: [USER_ROLES.ADMIN],
      },
      {
        title: 'Settings',
        href: '/dashboard/admin/settings',
        icon: Settings,
        roles: [USER_ROLES.ADMIN],
      },
      {
        title: 'Data',
        href: '/dashboard/admin/data',
        icon: Database,
        roles: [USER_ROLES.ADMIN],
      },
    ],
  },
];

export function Sidebar({
  className,
  isMobileOpen = false,
  onMobileClose
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = storage.get(STORAGE_KEYS.sidebarCollapsed);
    if (savedState === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    storage.set(STORAGE_KEYS.sidebarCollapsed, newState.toString());
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isExpanded = (href: string) => {
    return expandedItems.includes(href);
  };

  // Get current user with development bypass (similar to layout.tsx)
  const currentUser = user || {
    role: { name: 'Admin' },
    email: 'admin@dev.local',
    name: 'Admin User'
  };

  const userRole = typeof currentUser?.role === 'string'
    ? currentUser?.role?.toLowerCase()
    : currentUser?.role?.name?.toLowerCase() || 'user';

  // Debug logging for role detection
  console.log('🔍 Sidebar Debug:', {
    currentUser,
    userRole,
    totalNavItems: navItems.length,
    filteredNavItems: navItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(userRole);
    }).length
  });

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const handleLogoutClick = async () => {
    await logout();
  };

  return (
    <aside className={cn(
      'flex flex-col bg-gray-900 text-white transition-all duration-300 h-full',
      isCollapsed ? 'w-16' : 'w-64',
      'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full',
      'md:relative md:translate-x-0',
      className
    )}>
      {/* Header with Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700/50 flex-shrink-0 bg-gradient-to-r from-gray-900 to-gray-800">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-200">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-tight">ExamPapel</span>
              <span className="text-xs text-gray-400 font-medium">Exam Management</span>
            </div>
          </Link>
        )}

        {isCollapsed && !isMobileOpen && (
          <Link href="/dashboard" className="flex items-center justify-center">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </Link>
        )}

        {/* Mobile close button */}
        {isMobileOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileClose}
            className="md:hidden text-white hover:bg-gray-700 ml-auto"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Desktop collapse button */}
        {!isMobileOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="hidden md:flex h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50 ml-auto transition-all duration-200"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {filteredNavItems.map((item, index) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isItemActive = isActive(item.href);
          const isItemExpanded = isExpanded(item.href);
          
          // Add section separator before "My Progress" and "Administration"
          const showSeparator = !isCollapsed && (
            item.title === 'My Progress' || 
            item.title === 'Administration'
          );

          return (
            <div key={item.href}>
              {showSeparator && (
                <div className="my-3 border-t border-gray-700/50" />
              )}
              
              <Link
                href={hasChildren ? '#' : item.href}
                onClick={hasChildren ? (e) => {
                  e.preventDefault();
                  toggleExpanded(item.href);
                } : undefined}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer',
                  isItemActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50',
                  isCollapsed && 'justify-center px-2',
                  !isCollapsed && 'group'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors duration-200',
                  isItemActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                )} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {hasChildren && (
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform duration-200 text-gray-500 group-hover:text-gray-300',
                          isItemExpanded && 'rotate-90'
                        )}
                      />
                    )}
                  </>
                )}
              </Link>

              {/* Children */}
              {hasChildren && !isCollapsed && isItemExpanded && (
                <div className="ml-3 mt-1.5 space-y-0.5 border-l-2 border-gray-700/50 pl-3">
                  {item.children!
                    .filter(child => {
                      if (!child.roles) return true;
                      return child.roles.includes(userRole);
                    })
                    .map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = isActive(child.href);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center space-x-2.5 rounded-md px-3 py-2 text-sm transition-all duration-200 group',
                            isChildActive
                              ? 'bg-blue-600/20 text-blue-300 font-medium border-l-2 border-blue-400 -ml-[2px] pl-[10px]'
                              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
                          )}
                        >
                          <ChildIcon className={cn(
                            'h-4 w-4 flex-shrink-0 transition-colors duration-200',
                            isChildActive ? 'text-blue-300' : 'text-gray-600 group-hover:text-gray-400'
                          )} />
                          <span>{child.title}</span>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section with logout */}
      <div className="p-4 border-t border-gray-700/50 flex-shrink-0 bg-gradient-to-r from-gray-900 to-gray-800">
        <Button
          variant="ghost"
          onClick={handleLogoutClick}
          className={cn(
            'w-full text-gray-400 hover:text-white hover:bg-red-600/20 transition-all duration-200 font-medium',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </aside>
  );
} 