import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Send, 
  Settings, 
  GitBranch,
  Zap
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/pipeline", icon: GitBranch },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Quick Replies", href: "/quick-replies", icon: Zap },
  { name: "Sessions", href: "/sessions", icon: MessageSquare },
  { name: "Mass Messaging", href: "/mass-messaging", icon: Send },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">BeastCRM</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          onClick={handleSignOut} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};