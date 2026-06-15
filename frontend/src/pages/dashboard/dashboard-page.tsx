import { useAuthStore } from '@/store';
import {
  Users,
  Target,
  TrendingUp,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const stats = [
  { label: 'Total Contacts', value: '2,847', change: '+12.5%', up: true, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Active Leads', value: '184', change: '+8.2%', up: true, icon: Target, color: 'text-green-400', bg: 'bg-green-400/10' },
  { label: 'Open Deals', value: '$1.2M', change: '-3.1%', up: false, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Tasks Due Today', value: '12', change: '+2', up: true, icon: CheckSquare, color: 'text-amber-400', bg: 'bg-amber-400/10' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-xl p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground">Revenue Pipeline</h3>
          <p className="text-sm text-muted-foreground">Overview of your deal pipeline</p>
          <div className="mt-6 flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">
              Connect to PostgreSQL to load real data • Configure dashboard widgets in Settings
            </p>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground">Lead Sources</h3>
          <p className="text-sm text-muted-foreground">Where your leads come from</p>
          <div className="mt-6 flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">
              Highcharts widgets will render here • Add widgets from the dashboard config
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:bg-secondary/50"
            >
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Activity event placeholder #{i}
                </p>
                <p className="text-xs text-muted-foreground">
                  Connect to database to see real activity
                </p>
              </div>
              <span className="text-xs text-muted-foreground">Just now</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
