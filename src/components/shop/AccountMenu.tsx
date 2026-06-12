import { Link, useNavigate } from "@tanstack/react-router";
import { User, LogIn, LogOut, Package, MapPin, Heart, UserCircle, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function AccountMenu() {
  const { user, isAuthenticated, isReady, logout } = useAuth();
  const navigate = useNavigate();

  if (!isReady) {
    return (
      <span className="hidden lg:flex items-center gap-1.5 text-muted-foreground">
        <LogIn className="h-4 w-4" /> Sisene
      </span>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        to="/login"
        className="hidden lg:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <LogIn className="h-4 w-4" /> Sisene
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hidden lg:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
        <User className="h-4 w-4" />
        <span className="font-medium text-foreground">{user.first_name || user.email}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="text-sm font-semibold text-foreground">{user.first_name} {user.last_name}</div>
          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: "/konto" })}>
          <LayoutDashboard className="h-4 w-4" /> Minu konto
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/konto/tellimused" })}>
          <Package className="h-4 w-4" /> Tellimused
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/konto/aadressid" })}>
          <MapPin className="h-4 w-4" /> Aadressid
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/konto/soovinimekiri" })}>
          <Heart className="h-4 w-4" /> Soovinimekiri
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/konto/profiil" })}>
          <UserCircle className="h-4 w-4" /> Profiil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => { await logout(); navigate({ to: "/" }); }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Logi välja
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
