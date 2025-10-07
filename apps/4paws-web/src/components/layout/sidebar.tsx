import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Dog, 
  Users, 
  ClipboardPlus, 
  Stethoscope, 
  HeartHandshake, 
  HeartPulse, 
  HandHeart, 
  BarChart3, 
  Settings 
} from "lucide-react";
import UserAccountDropdown from "../ui/user-account-dropdown";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Animals", href: "/animals", icon: Dog },
  { name: "People", href: "/people", icon: Users },
  { name: "Intake", href: "/intake", icon: ClipboardPlus },
  { name: "Medical", href: "/medical", icon: Stethoscope },
  { name: "Adoptions", href: "/adoptions", icon: HeartHandshake },
  { name: "Fosters", href: "/fosters", icon: HeartPulse },
  { name: "Volunteers", href: "/volunteers", icon: HandHeart },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-card border-r border-border">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto px-4 py-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2" data-testid="link-logo">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-primary-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Kirby</h2>
            <p className="text-xs text-muted-foreground" data-testid="text-org-name">Demo Shelter</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-1 flex-col">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    data-testid={`link-nav-${item.name.toLowerCase()}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Settings at Bottom */}
          <div className="mt-auto pt-4 border-t border-border">
            <Link 
              href="/settings"
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid="link-settings"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </div>
        </nav>

        {/* User Account Dropdown */}
        <UserAccountDropdown variant="sidebar" />
      </div>
    </aside>
  );
}
