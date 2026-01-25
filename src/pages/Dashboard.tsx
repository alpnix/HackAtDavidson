import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RegistrationsTable from "@/components/RegistrationsTable";
import { BlogSection } from "@/components/BlogSection";
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
import { LayoutDashboard, LogOut, User, FileText } from "lucide-react";

type TabId = "registrations" | "blog";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<DashboardRole>("ADVISOR");
  const [activeTab, setActiveTab] = useState<TabId>("registrations");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
                  <SidebarMenuButton
                    isActive={activeTab === "registrations"}
                    onClick={() => setActiveTab("registrations")}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Registrations</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeTab === "blog"}
                    onClick={() => setActiveTab("blog")}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Blog</span>
                  </SidebarMenuButton>
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
        <main className="relative flex flex-1 flex-col p-6">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 sharp-clip" />
            <div className="absolute bottom-20 left-0 w-48 h-48 bg-accent/10 rotate-45 opacity-50" />
          </div>
          <div className="relative z-10 mb-6">
            <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage Hack@Davidson registrations</p>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="flex-1 space-y-6">
            <TabsList className="bg-muted/80 p-1 rounded-lg">
              <TabsTrigger
                value="registrations"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                Registrations
              </TabsTrigger>
              <TabsTrigger
                value="blog"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                Blog
              </TabsTrigger>
            </TabsList>
            <TabsContent value="registrations">
              <Card className="border-border bg-card/95 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-primary">Registrations</CardTitle>
                  <CardDescription>View, search, and filter hackathon registrations.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegistrationsTable />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="blog">
              <Card className="border-border bg-card/95 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-primary">Blog</CardTitle>
                  <CardDescription>Manage blog posts. Displayed and archived.</CardDescription>
                </CardHeader>
                <CardContent>
                  <BlogSection />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
