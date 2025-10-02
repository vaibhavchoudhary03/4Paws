import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-muted/30">
      {!isMobile && <Sidebar />}
      
      <div className={isMobile ? "" : "lg:pl-64"}>
        {/* Top Header */}
        <header className="bg-card border-b border-border px-4 lg:px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="lg:hidden" data-testid="button-mobile-menu">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </Button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground" data-testid="text-page-title">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground hidden lg:block" data-testid="text-page-subtitle">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                <Bell className="w-6 h-6 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              <Button className="hidden lg:flex" data-testid="button-quick-intake">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Quick Intake
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-8" data-testid="main-content">
          {children}
        </main>

        {isMobile && <MobileNav />}
      </div>
    </div>
  );
}
