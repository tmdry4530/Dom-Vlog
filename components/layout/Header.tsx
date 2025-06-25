'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Home, BookOpen, User, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  className?: string;
}

const navigation = [
  { name: '홈', href: '/', icon: Home },
  { name: '블로그', href: '/blog', icon: BookOpen },
  { name: '프로필', href: '/profile', icon: User },
  { name: '설정', href: '/settings', icon: Settings },
];

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">
                D
              </span>
            </div>
            <span className="hidden font-bold sm:inline-block">Dom Vlog</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigation.map((item) => (
              <NavigationMenuItem key={item.name}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
                      pathname === item.href &&
                        'bg-accent text-accent-foreground'
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other components can go here */}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Phase 1
            </Badge>

            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatar.jpg" alt="User" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <Separator />
          <nav className="grid gap-1 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href && 'bg-accent text-accent-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
