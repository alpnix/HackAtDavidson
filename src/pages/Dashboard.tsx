import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatistics } from "@/components/DashboardStatistics";
import RegistrationsTable from "@/components/RegistrationsTable";
import { BlogSection } from "@/components/BlogSection";
import { FormsSection } from "@/components/FormsSection";
import { BarChart3, Users, FileText, FormInput } from "lucide-react";

type TabId = "statistics" | "registrations" | "blog" | "forms";

const pathToTab: Record<string, TabId> = {
  "/dashboard": "statistics",
  "/dashboard/registrations": "registrations",
  "/dashboard/blog": "blog",
  "/dashboard/forms": "forms",
};

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tabFromPath = pathToTab[location.pathname] ?? "statistics";
  const [activeTab, setActiveTab] = useState<TabId>(tabFromPath);

  useEffect(() => {
    setActiveTab(tabFromPath);
  }, [tabFromPath]);

  const handleTabChange = (v: string) => {
    const t = v as TabId;
    setActiveTab(t);
    if (t === "statistics") navigate("/dashboard", { replace: true });
    else if (t === "registrations") navigate("/dashboard/registrations", { replace: true });
    else if (t === "blog") navigate("/dashboard/blog", { replace: true });
    else if (t === "forms") navigate("/dashboard/forms", { replace: true });
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
          Overview and manage Hack@Davidson
        </p>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 space-y-6"
      >
        <TabsList className="bg-muted/80 p-1 rounded-lg">
          <TabsTrigger
            value="statistics"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md gap-1.5"
          >
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger
            value="registrations"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md gap-1.5"
          >
            <Users className="h-4 w-4" />
            Registrations
          </TabsTrigger>
          <TabsTrigger
            value="blog"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md gap-1.5"
          >
            <FileText className="h-4 w-4" />
            Blog
          </TabsTrigger>
          <TabsTrigger
            value="forms"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md gap-1.5"
          >
            <FormInput className="h-4 w-4" />
            Forms
          </TabsTrigger>
        </TabsList>
        <TabsContent value="statistics">
          <Card className="border-border bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">Statistics</CardTitle>
              <CardDescription>
                Registration overview, check-ins, and breakdowns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardStatistics />
            </CardContent>
          </Card>
        </TabsContent>
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
      </Tabs>
    </main>
  );
};

export default Dashboard;
