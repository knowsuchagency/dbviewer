import { Link, useLocation } from "react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import { FileCode, FolderOpen } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold">DBML Viewer</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant={location.pathname.startsWith("/viewer") ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/viewer">
                <FileCode className="h-4 w-4 mr-2" />
                Viewer
              </Link>
            </Button>
            {isAuthenticated && (
              <Button
                variant={location.pathname === "/diagrams" ? "secondary" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/diagrams">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  My Diagrams
                </Link>
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button variant="ghost" onClick={() => logout()}>
              Logout
            </Button>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
              )}
              {location.pathname !== "/signup" && (
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              )}
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
