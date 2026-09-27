"use client"

import { Bell, Search, Sun, Moon, Languages } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/components/language-provider';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder={t('topbar.search')}
            className="pl-9 bg-muted/50 border-transparent hover:border-border h-9 focus-visible:ring-1 rounded-full text-sm" 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
          className="relative text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm font-medium bg-muted/50 px-2 py-1 rounded-md"
        >
          <Languages className="w-4 h-4" />
          <span className="uppercase">{language}</span>
        </button>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute top-1 left-1 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>

        <button className="relative text-muted-foreground hover:text-foreground transition-colors p-1">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background" />
        </button>
        
        <div className="flex items-center gap-3 ml-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-none">Trần Minh Chiến</p>
            <p className="text-xs text-muted-foreground mt-1">{t('topbar.leadBa')}</p>
          </div>
          <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
            <AvatarImage src="https://i.pravatar.cc/150?u=chien" alt="Chiến" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">TC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
