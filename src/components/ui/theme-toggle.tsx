'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Monitor } from 'lucide-react';
import { THEME_CONFIG, STORAGE_KEYS } from '@/lib/constants';
import { theme } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = theme.get() as Theme;
    setCurrentTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (currentTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(currentTheme);
    }
  }, [currentTheme]);

  const handleThemeChange = (newTheme: Theme) => {
    setCurrentTheme(newTheme);
    theme.set(newTheme);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 px-0">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0">
          {getThemeIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEME_CONFIG.themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption}
            onClick={() => handleThemeChange(themeOption)}
            className={currentTheme === themeOption ? 'bg-accent' : ''}
          >
            {themeOption === 'light' && <Sun className="mr-2 h-4 w-4" />}
            {themeOption === 'dark' && <Moon className="mr-2 h-4 w-4" />}
            {themeOption === 'system' && <Monitor className="mr-2 h-4 w-4" />}
            <span className="capitalize">{themeOption}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple theme toggle for mobile or compact spaces
export function SimpleThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = theme.get() as Theme;
    setCurrentTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (currentTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(currentTheme);
    }
  }, [currentTheme]);

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    
    setCurrentTheme(newTheme);
    theme.set(newTheme);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 px-0">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  return (
    <Button variant="ghost" size="sm" className="w-9 px-0" onClick={toggleTheme}>
      {getThemeIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 