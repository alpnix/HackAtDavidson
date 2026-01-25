import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, Search, Eye } from "lucide-react";
import { RegistrationDetailDialog } from "@/components/RegistrationDetailDialog";

type Registration = Tables<"registrations">;

const PAGE_SIZE = 10;

const LEVEL_OPTIONS = [
  { value: "all", label: "All levels" },
  { value: "high-school", label: "High School" },
  { value: "undergraduate-freshman", label: "Undergraduate – Freshman" },
  { value: "undergraduate-sophomore", label: "Undergraduate – Sophomore" },
  { value: "undergraduate-junior", label: "Undergraduate – Junior" },
  { value: "undergraduate-senior", label: "Undergraduate – Senior" },
  { value: "graduate", label: "Graduate" },
  { value: "other", label: "Other" },
];

const DISCORD_OPTIONS = [
  { value: "all", label: "All" },
  { value: "true", label: "Joined" },
  { value: "false", label: "Not joined" },
];

const TRANSPORT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "maybe", label: "Maybe" },
];

const RegistrationsTable = () => {
  const [data, setData] = useState<Registration[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [discordFilter, setDiscordFilter] = useState("all");
  const [transportFilter, setTransportFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, levelFilter, discordFilter, transportFilter]);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from("registrations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (searchQuery) {
        const term = `%${searchQuery}%`;
        q = q.or(
          `email.ilike.${term},first_name.ilike.${term},last_name.ilike.${term},school.ilike.${term}`
        );
      }
      if (levelFilter && levelFilter !== "all") q = q.eq("level_of_study", levelFilter);
      if (discordFilter && discordFilter !== "all") q = q.eq("discord_joined", discordFilter === "true");
      if (transportFilter && transportFilter !== "all") q = q.eq("airport_transportation", transportFilter);

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data: rows, error: err, count } = await q.range(from, to);

      if (err) throw err;
      setData(rows ?? []);
      setTotal(count ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load registrations");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, levelFilter, discordFilter, transportFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = !!(
    searchQuery ||
    (levelFilter && levelFilter !== "all") ||
    (discordFilter && discordFilter !== "all") ||
    (transportFilter && transportFilter !== "all")
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search email, name, or school…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Level of study" />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={discordFilter} onValueChange={setDiscordFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Discord" />
              </SelectTrigger>
              <SelectContent>
                {DISCORD_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={transportFilter} onValueChange={setTransportFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Airport" />
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{total}</span>
            <span className="text-sm text-muted-foreground">
              {hasFilters ? "matching" : "total"} registration{total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No registrations found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-primary font-semibold">Email</TableHead>
                <TableHead className="text-primary font-semibold">First name</TableHead>
                <TableHead className="text-primary font-semibold">Last name</TableHead>
                <TableHead className="text-primary font-semibold">Phone</TableHead>
                <TableHead className="text-primary font-semibold">School</TableHead>
                <TableHead className="text-primary font-semibold text-center">Discord</TableHead>
                <TableHead className="w-[100px] text-primary font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r) => (
                <TableRow key={r.id} className="border-border">
                  <TableCell className="font-medium">{r.email}</TableCell>
                  <TableCell>{r.first_name}</TableCell>
                  <TableCell>{r.last_name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.phone_number}</TableCell>
                  <TableCell>{r.school}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={r.discord_joined ? "default" : "secondary"}
                      className={r.discord_joined ? "bg-primary" : ""}
                    >
                      {r.discord_joined ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => {
                        setSelectedRegistration(r);
                        setDetailOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View more
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {!loading && !error && data.length > 0 && totalPages > 1 && (
        <Pagination>
          <PaginationContent className="flex-wrap gap-2">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage((p) => p - 1);
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                aria-disabled={page <= 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 7) return true;
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - page) <= 1) return true;
                return false;
              })
              .map((p, idx, arr) => [
                idx > 0 && arr[idx - 1] !== p - 1 ? (
                  <PaginationItem key={`ellipsis-${p}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : null,
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                    isActive={page === p}
                    className="min-w-[2.25rem] justify-center"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>,
              ])
              .flat()
              .filter(Boolean)}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage((p) => p + 1);
                }}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                aria-disabled={page >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <RegistrationDetailDialog
        registration={selectedRegistration}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
};

export default RegistrationsTable;
