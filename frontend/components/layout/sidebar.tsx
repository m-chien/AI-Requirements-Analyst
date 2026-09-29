"use client"

import Link from 'next/link';
import { Home, FolderKanban, MessageSquareText, History, Settings, UserCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/language-provider';
import { useStore } from '@/store/useStore';

export function Sidebar() {
  const { t } = useLanguage();
  const { projects, activeProjectId } = useStore();

  return (
    <div className="w-64 border-r bg-sidebar h-full flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b h-14 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          AI
        </div>
        <span className="font-semibold text-sm text-sidebar-foreground truncate">Requirements Analyst</span>
      </div>
      
      <div className="p-4 flex-1 flex flex-col gap-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('sidebar.workspace')}</h3>
          <nav className="flex flex-col gap-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-foreground bg-accent/10 text-accent">
              <Home className="w-4 h-4" />
              {t('sidebar.dashboard')}
            </Link>
            <Link href="/projects" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <FolderKanban className="w-4 h-4" />
              {t('sidebar.allProjects')}
            </Link>
            <Link href="/clarifications" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <MessageSquareText className="w-4 h-4" />
              {t('sidebar.clarifications')}
            </Link>
            <Link href="/change-requests" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <History className="w-4 h-4" />
              {t('sidebar.changeRequests')}
            </Link>
          </nav>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('sidebar.recentProjects')}</h3>
          </div>
          <nav className="flex flex-col gap-1">
            {projects.slice(0, 5).map(project => (
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`} 
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors truncate ${activeProjectId === project.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${activeProjectId === project.id ? 'bg-primary' : 'bg-muted-foreground'}`} />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground italic">
                {t('sidebar.noProjects', 'No recent projects')}
              </div>
            )}
          </nav>
          <Button variant="ghost" className="w-full justify-start mt-2 text-primary font-medium hover:text-primary hover:bg-primary/5 h-9 px-3 text-sm">
            <Plus className="w-4 h-4 mr-3" />
            {t('sidebar.newProject')}
          </Button>
        </div>
      </div>

      <div className="p-4 border-t mt-auto">
        <nav className="flex flex-col gap-1">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings className="w-4 h-4" />
            {t('sidebar.settings')}
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <UserCircle className="w-4 h-4" />
            Trần Minh Chiến (BA)
          </Link>
        </nav>
      </div>
    </div>
  );
}
