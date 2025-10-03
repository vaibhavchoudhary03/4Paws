import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-navigation";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TouchButton } from "@/components/ui/touch-button";
import NotificationDropdown from "@/components/ui/notification-dropdown";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-muted/30">
      {!isMobile && <Sidebar />}
      
      <div className={isMobile ? "" : "lg:pl-64"}>
        {/* Top Header */}
        <header className="bg-card border-b border-border px-4 lg:px-8 py-3 lg:py-4 sticky top-0 z-30 safe-area-pt">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <TouchButton
                variant="ghost"
                size="md"
                className="lg:hidden"
                data-testid="button-mobile-menu"
                icon={<Menu className="w-5 h-5" />}
                touchTarget={true}
              >
                Menu
              </TouchButton>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-2xl font-bold text-foreground truncate" data-testid="text-page-title">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground hidden lg:block truncate" data-testid="text-page-subtitle">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 lg:space-x-4">
              {actions && (
                <div className="hidden sm:block mr-2 lg:mr-4">
                  {actions}
                </div>
              )}
              <NotificationDropdown data-testid="notification-dropdown" />
              <TouchButton
                className="hidden lg:flex"
                data-testid="button-quick-intake"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5" />}
                touchTarget={false}
              >
                Quick Intake
              </TouchButton>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-3 lg:p-8 pb-20 lg:pb-8" data-testid="main-content">
          {children}
        </main>

        {/* Mobile Navigation */}
        {isMobile && <MobileNav />}
      </div>
    </div>
  );
}
