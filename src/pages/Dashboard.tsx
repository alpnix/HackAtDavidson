import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RegistrationsTable from "@/components/RegistrationsTable";
import { BlogSection } from "@/components/BlogSection";
import { FormsSection } from "@/components/FormsSection";
import { ProjectRegistrationSection } from "@/components/ProjectRegistrationSection";
import { SettingsSection } from "@/components/SettingsSection";

type TabId = "registrations" | "blog" | "forms" | "project-registration" | "settings";

const pathToTab: Record<string, TabId> = {
  "/dashboard": "registrations",
  "/dashboard/blog": "blog",
  "/dashboard/forms": "forms",
  "/dashboard/project-registration": "project-registration",
  "/dashboard/settings": "settings",
};

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tabFromPath = pathToTab[location.pathname] ?? "registrations";
  const [activeTab, setActiveTab] = useState<TabId>(tabFromPath);

  useEffect(() => {
    setActiveTab(tabFromPath);
  }, [tabFromPath]);

  const handleTabChange = (v: string) => {
    const t = v as TabId;
    setActiveTab(t);
    if (t === "registrations") navigate("/dashboard", { replace: true });
    else if (t === "blog") navigate("/dashboard/blog", { replace: true });
    else if (t === "forms") navigate("/dashboard/forms", { replace: true });
    else if (t === "project-registration") navigate("/dashboard/project-registration", { replace: true });
    else if (t === "settings") navigate("/dashboard/settings", { replace: true });
  };

  return (
    <main className="relative flex flex-1 flex-col p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 sharp-clip" />
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-accent/10 rotate-45 opacity-50" />
      </div>
      <div className="relative z-10 mb-6">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage Hack@Davidson registrations
        </p>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 space-y-6"
      >
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
          <TabsTrigger
            value="forms"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
          >
            Forms
          </TabsTrigger>
          <TabsTrigger
            value="project-registration"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
          >
            Project registration
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="registrations">
          <Card className="border-border bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">Registrations</CardTitle>
              <CardDescription>
                View, search, and filter hackathon registrations.
              </CardDescription>
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
              <CardDescription>
                Manage blog posts. Displayed and archived.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlogSection />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="forms">
          <Card className="border-border bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">Forms</CardTitle>
              <CardDescription>
                Create custom forms and view submissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormsSection />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="project-registration">
          <Card className="border-border bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">Project registration</CardTitle>
              <CardDescription>
                Share the project registration link and QR code. Open or close via Settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectRegistrationSection />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card className="border-border bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">Settings</CardTitle>
              <CardDescription>
                View and edit app settings. Use the row menu to edit a value.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Dashboard;
