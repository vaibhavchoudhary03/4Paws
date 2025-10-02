import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Dog, ClipboardPlus, Stethoscope, Menu } from "lucide-react";

const navigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Animals", href: "/animals", icon: Dog },
  { name: "Intake", href: "/intake", icon: ClipboardPlus },
  { name: "Medical", href: "/medical", icon: Stethoscope },
  { name: "More", href: "/more", icon: Menu },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden bg-card border-t border-border px-2 py-2 flex items-center justify-around fixed bottom-0 left-0 right-0 z-50">
      {navigation.map((item, index) => {
        const isActive = location === item.href;
        const isCenter = index === 2; // Intake button in center
        
        if (isCenter) {
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center justify-center w-14 h-14 -mt-6 bg-primary rounded-full text-primary-foreground shadow-lg"
              data-testid={`link-mobile-${item.name.toLowerCase()}`}
            >
              <item.icon className="w-7 h-7" />
            </Link>
          );
        }
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
            data-testid={`link-mobile-${item.name.toLowerCase()}`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
