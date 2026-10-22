import { NavLink, Outlet, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Archive, FileText, Pin, LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [close, setClose] = useState(false);

  function handleLogout() {
    logout();
    navigate("/auth", { replace: true });
  }

  function handleSidebarClose() {
    setClose((prev) => !prev);
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* sidebar */}
      <aside
      // className={`w-64 border-r bg-background  ${close ? "md:hidden" : "md:flex md:flex-col"} `}
      className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col"
      >
        <div className="border-b p-6 flex justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Notes App</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your space for ideas</p>
          </div>
          <Menu className="size-6 cursor-pointer" onClick={handleSidebarClose} />
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <NavLink
            to="/notes"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
            }
          >
            <FileText className="size-4" />
            All Notes
          </NavLink>

          <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
            <Pin className="size-4" />
            Pinned
          </div>
          <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
            <Archive className="size-4" />
            Archived
          </div>
        </nav>

        <div className="border-t p-4">
          <Button
            variant="destructive"
            onClick={handleLogout}
            type="button"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm"
          >
            <LogOut className="size-4" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>
      {/* main content */}
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
