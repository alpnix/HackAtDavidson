import { useEffect, useState } from "react";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatRole } from "@/lib/constants";
import type { DashboardRole } from "@/lib/constants";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { BarChart3, Users, LogOut, User, FileText, FormInput } from "lucide-react";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<DashboardRole>("ADVISOR");

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) return;
      const { data: profile } = await supabase
        .from("profile")
        .select("firstname, lastname, role")
        .eq("email", user.email)
        .maybeSingle();
      if (profile) {
        setUserName(`${profile.firstname} ${profile.lastname}`.trim() || "User");
        setUserRole((profile.role as DashboardRole) || "ADVISOR");
      } else {
        setUserName(user.email.split("@")[0] || "User");
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <Sidebar side="left" className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex flex-col gap-1 px-2 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {userName || "…"}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/70">
                  {formatRole(userRole)}
                </p>
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <NavLink to="/dashboard" end>
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <BarChart3 className="h-4 w-4" />
                        <span>Statistics</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NavLink to="/dashboard/registrations">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <Users className="h-4 w-4" />
                        <span>Registrations</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NavLink to="/dashboard/blog">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <FileText className="h-4 w-4" />
                        <span>Blog</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NavLink to="/dashboard/forms" end={false}>
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <FormInput className="h-4 w-4" />
                        <span>Forms</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
