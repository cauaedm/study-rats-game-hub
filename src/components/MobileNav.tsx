import { useNavigate, useLocation } from "react-router-dom";
import { Home, Timer, Users, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav as MobileNavImport } from "@/components/MobileNav";

export { MobileNav as default };

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/feed", icon: Home, label: "Feed" },
    { path: "/dashboard", icon: Timer, label: "Estudar" },
    { path: "/groups", icon: Users, label: "Grupos" },
  ];

  const secondaryItems = [
    { path: "/profile", icon: User, label: "Perfil" },
    { path: "/settings", icon: Settings, label: "Config" },
  ];

  return (
    <>
      {/* Main Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg transition-colors ${
                isActive(item.path) 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Secondary Top Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-md border-b border-border z-40 safe-area-inset-top">
        <div className="flex justify-end items-center h-14 max-w-2xl mx-auto px-4 gap-2">
          {secondaryItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`${
                isActive(item.path)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};
