import { useAuthStore } from '@/store';
import { UserRole } from '@/types';
import { Settings, Users, Database, Key, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();

  const settingsSections = [
    { icon: Users, label: 'User Management', description: 'Manage users and roles', adminOnly: true },
    { icon: Database, label: 'Schema Builder', description: 'Create custom entities and fields', adminOnly: true },
    { icon: Key, label: 'API Tokens', description: 'Manage developer API tokens', adminOnly: false },
    { icon: Palette, label: 'Dashboard Config', description: 'Configure dashboard widgets', adminOnly: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your CRM configuration</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections
          .filter((s) => !s.adminOnly || user?.role === UserRole.ADMIN)
          .map((section) => (
            <div
              key={section.label}
              className="glass cursor-pointer rounded-xl p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{section.label}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Profile section */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground">Profile</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="mt-1 text-foreground">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <p className="mt-1 capitalize text-foreground">{user?.role}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="mt-1 text-foreground">{user?.firstName} {user?.lastName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
