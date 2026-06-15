import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store';
import {
  LayoutDashboard,
  Users,
  Target,
  TrendingUp,
  CheckSquare,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/contacts', icon: Users, label: 'Contacts' },
  { path: '/leads', icon: Target, label: 'Leads' },
  { path: '/opportunities', icon: TrendingUp, label: 'Opportunities' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { isCollapsed, toggle } = useSidebarStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold gradient-text">CRM Pro</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary glow-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                isCollapsed && 'justify-center px-2',
              )}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
