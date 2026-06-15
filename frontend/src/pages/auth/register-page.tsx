import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api';
import { useAuthStore } from '@/store';
import { toast } from 'sonner';
import { Zap, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authApi.register(form);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user as any);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass rounded-2xl p-8">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 glow-primary">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Start managing your business today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)}
                    className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="John" required />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Doe" required />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="you@company.com" required />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="••••••••" minLength={8} required />
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="h-11 w-full rounded-lg bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
