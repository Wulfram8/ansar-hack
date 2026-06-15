import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import Header from './header';
import { useSidebarStore } from '@/store';

export default function AppLayout() {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className="flex flex-1 flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '64px' : '256px' }}
      >
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
