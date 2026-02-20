import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, UserCheck, Shirt, GraduationCap, Plane, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

type Registration = Tables<"registrations">;

const LEVEL_LABELS: Record<string, string> = {
  "high-school": "High School",
  "undergraduate-freshman": "Fr.",
  "undergraduate-sophomore": "So.",
  "undergraduate-junior": "Jr.",
  "undergraduate-senior": "Sr.",
  graduate: "Graduate",
  other: "Other",
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

export function DashboardStatistics() {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: rows, error: err } = await supabase
          .from("registrations")
          .select("*")
          .order("created_at", { ascending: false });
        if (err) throw err;
        setData(rows ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  const total = data.length;
  const checkedIn = data.filter((r) => !!r.checked_in).length;
  const checkInRate = total ? Math.round((checkedIn / total) * 100) : 0;

  // T-shirt sizes
  const tshirtCounts = data.reduce<Record<string, number>>((acc, r) => {
    const s = (r.tshirt_size || "unknown").toUpperCase();
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});
  const tshirtData = Object.entries(tshirtCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Top 5 schools
  const schoolCounts = data.reduce<Record<string, number>>((acc, r) => {
    const s = r.school?.trim() || "Unknown";
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});
  const topSchools = Object.entries(schoolCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Level of study
  const levelCounts = data.reduce<Record<string, number>>((acc, r) => {
    const key = r.level_of_study || "other";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const levelData = Object.entries(levelCounts).map(([key, value]) => ({
    name: LEVEL_LABELS[key] ?? key,
    value,
  }));

  // Airport transport
  const transportCounts = data.reduce<Record<string, number>>((acc, r) => {
    const t = r.airport_transportation || "no";
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});
  const transportData = Object.entries(transportCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Registrations by day (last 14 days or since first)
  const byDay = data.reduce<Record<string, number>>((acc, r) => {
    if (!r.created_at) return acc;
    const day = r.created_at.slice(0, 10);
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});
  const sortedDays = Object.keys(byDay).sort();
  const recentDays = sortedDays.slice(-14);
  const byDayData = recentDays.map((d) => ({
    date: format(parseISO(d), "MMM d"),
    registrations: byDay[d] ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card/95">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total registrations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{total}</div>
            <p className="text-xs text-muted-foreground">Hackers registered</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/95">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checked in
            </CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{checkedIn}</div>
            <p className="text-xs text-muted-foreground">
              {checkInRate}% check-in rate
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/95">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending check-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{total - checkedIn}</div>
            <p className="text-xs text-muted-foreground">Not yet checked in</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/95">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top school
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary truncate" title={topSchools[0]?.name}>
              {topSchools[0]?.name ?? "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {topSchools[0] ? `${topSchools[0].count} registration${topSchools[0].count !== 1 ? "s" : ""}` : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* T-shirt sizes */}
        <Card className="border-border bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shirt className="h-5 w-5" />
              T-shirt sizes
            </CardTitle>
            <CardDescription>Distribution by size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {tshirtData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tshirtData} layout="vertical" margin={{ left: 12, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis type="category" dataKey="name" width={32} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                      formatter={(value: number) => [value, "Registrations"]}
                      labelFormatter={(label) => `Size ${label}`}
                    />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top 5 schools */}
        <Card className="border-border bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <GraduationCap className="h-5 w-5" />
              Top 5 schools
            </CardTitle>
            <CardDescription>By registration count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {topSchools.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSchools} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickFormatter={(v) => (v.length > 18 ? v.slice(0, 17) + "…" : v)}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                      formatter={(value: number) => [value, "Registrations"]}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Level of study */}
        <Card className="border-border bg-card/95">
          <CardHeader>
            <CardTitle className="text-primary">Level of study</CardTitle>
            <CardDescription>Distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              {levelData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={levelData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {levelData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                      formatter={(value: number) => [value, "Registrations"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Airport transport */}
        <Card className="border-border bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Plane className="h-5 w-5" />
              Airport transportation
            </CardTitle>
            <CardDescription>Need ride to/from airport</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              {transportData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={transportData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {transportData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                      formatter={(value: number) => [value, "Registrations"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registrations over time */}
      {byDayData.length > 0 && (
        <Card className="border-border bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="h-5 w-5" />
              Registrations over time
            </CardTitle>
            <CardDescription>Last 14 days with activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDayData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    formatter={(value: number) => [value, "Registrations"]}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="registrations" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
