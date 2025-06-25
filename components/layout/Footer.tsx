import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Github, Twitter, Mail, Rss } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const footerLinks = {
  블로그: [
    { name: '최근 글', href: '/blog' },
    { name: '카테고리', href: '/blog/categories' },
    { name: 'RSS', href: '/rss.xml' },
  ],
  정보: [
    { name: '소개', href: '/about' },
    { name: '연락처', href: '/contact' },
    { name: '개인정보처리방침', href: '/privacy' },
  ],
};

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com', icon: Github },
  { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { name: 'Email', href: 'mailto:contact@domvlog.com', icon: Mail },
  { name: 'RSS', href: '/rss.xml', icon: Rss },
];

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container py-8 md:py-12">
        {/* Main footer content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">
                  D
                </span>
              </div>
              <span className="font-bold">Dom Vlog</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI 기능이 내장된 개인 기술 블로그 플랫폼. 자동 스타일링, SEO
              최적화, 카테고리 추천 기능을 제공합니다.
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Phase 1</Badge>
              <Badge variant="secondary">개인 사용</Badge>
            </div>
          </div>

          {/* Links sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="font-semibold">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social links */}
          <div className="space-y-4">
            <h3 className="font-semibold">소셜</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={
                    social.href.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom section */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Dom Vlog. All rights reserved.
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Built with Next.js & Supabase</span>
            <Separator orientation="vertical" className="h-4" />
            <span>AI-powered</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
