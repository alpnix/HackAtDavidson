import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Loader2, Search, CheckCircle2, Circle, Download, Columns } from "lucide-react";
import { RegistrationDetailDialog } from "@/components/RegistrationDetailDialog";
import { AdminRegisterDialog } from "@/components/AdminRegisterDialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";

type Registration = Tables<"registrations">;

const COLUMN_OPTIONS: { id: keyof Registration; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "first_name", label: "First name" },
  { id: "last_name", label: "Last name" },
  { id: "phone_number", label: "Phone" },
  { id: "school", label: "School" },
  { id: "level_of_study", label: "Level of study" },
  { id: "country_of_residence", label: "Country" },
  { id: "age", label: "Age" },
  { id: "tshirt_size", label: "T-shirt size" },
  { id: "airport_transportation", label: "Airport transport" },
  { id: "checked_in", label: "Check-in" },
  { id: "checked_in_at", label: "Checked in at" },
  { id: "created_at", label: "Created at" },
  { id: "dietary_restrictions", label: "Dietary" },
  { id: "allergies_detail", label: "Allergies" },
  { id: "other_accommodations", label: "Accommodations" },
  { id: "additional_notes", label: "Notes" },
];

const DEFAULT_COLUMNS: (keyof Registration)[] = [
  "email",
  "first_name",
  "last_name",
  "phone_number",
  "school",
  "checked_in",
];

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


const TRANSPORT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "maybe", label: "Maybe" },
];

const CHECK_IN_OPTIONS = [
  { value: "all", label: "All" },
  { value: "true", label: "Checked in" },
  { value: "false", label: "Not checked in" },
];

const PARAM_Q = "q";
const PARAM_LEVEL = "level";
const PARAM_TRANSPORT = "transport";
const PARAM_CHECK_IN = "checkIn";

const RegistrationsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Registration[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(() => searchParams.get(PARAM_Q) ?? "");
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get(PARAM_Q) ?? "");
  const [levelFilter, setLevelFilter] = useState(() => searchParams.get(PARAM_LEVEL) ?? "all");
  const [transportFilter, setTransportFilter] = useState(() => searchParams.get(PARAM_TRANSPORT) ?? "all");
  const [checkInFilter, setCheckInFilter] = useState(() => searchParams.get(PARAM_CHECK_IN) ?? "all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<(keyof Registration)[]>(() => [...DEFAULT_COLUMNS]);

  const toggleColumn = useCallback((id: keyof Registration) => {
    setSelectedColumns((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      if (next.length === 0) return prev;
      return next;
    });
  }, []);

  // Sync URL -> state (on load and when URL changes e.g. back/forward)
  useEffect(() => {
    const q = searchParams.get(PARAM_Q) ?? "";
    const level = searchParams.get(PARAM_LEVEL) ?? "all";
    const transport = searchParams.get(PARAM_TRANSPORT) ?? "all";
    const checkIn = searchParams.get(PARAM_CHECK_IN) ?? "all";
    setSearchInput(q);
    setSearchQuery(q);
    setLevelFilter(level);
    setTransportFilter(transport);
    setCheckInFilter(checkIn);
  }, [searchParams]);

  // Debounce search and push to URL (sync effect will update searchQuery from URL)
  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = searchInput.trim();
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        if (trimmed) p.set(PARAM_Q, trimmed);
        else p.delete(PARAM_Q);
        return p;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, setSearchParams]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, levelFilter, transportFilter, checkInFilter]);

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
        const words = searchQuery.trim().split(/\s+/).filter(Boolean);
        const orParts = [
          `email.ilike.${term}`,
          `first_name.ilike.${term}`,
          `last_name.ilike.${term}`,
          `school.ilike.${term}`,
        ];
        if (words.length >= 2) {
          const w1 = `%${words[0]}%`;
          const w2 = `%${words[1]}%`;
          orParts.push(
            `and(first_name.ilike.${w1},last_name.ilike.${w2})`,
            `and(first_name.ilike.${w2},last_name.ilike.${w1})`
          );
        }
        q = q.or(orParts.join(","));
      }
      if (levelFilter && levelFilter !== "all") q = q.eq("level_of_study", levelFilter);
      if (transportFilter && transportFilter !== "all") q = q.eq("airport_transportation", transportFilter);
      if (checkInFilter && checkInFilter !== "all") q = q.eq("checked_in", checkInFilter === "true");

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
  }, [page, searchQuery, levelFilter, transportFilter, checkInFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = !!(
    searchQuery ||
    (levelFilter && levelFilter !== "all") ||
    (transportFilter && transportFilter !== "all") ||
    (checkInFilter && checkInFilter !== "all")
  );

  const buildFilteredQuery = useCallback(() => {
    let q = supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (searchQuery) {
      const term = `%${searchQuery}%`;
      const words = searchQuery.trim().split(/\s+/).filter(Boolean);
      const orParts = [
        `email.ilike.${term}`,
        `first_name.ilike.${term}`,
        `last_name.ilike.${term}`,
        `school.ilike.${term}`,
      ];
      if (words.length >= 2) {
        const w1 = `%${words[0]}%`;
        const w2 = `%${words[1]}%`;
        orParts.push(
          `and(first_name.ilike.${w1},last_name.ilike.${w2})`,
          `and(first_name.ilike.${w2},last_name.ilike.${w1})`
        );
      }
      q = q.or(orParts.join(","));
    }
    if (levelFilter && levelFilter !== "all") q = q.eq("level_of_study", levelFilter);
    if (transportFilter && transportFilter !== "all") q = q.eq("airport_transportation", transportFilter);
    if (checkInFilter && checkInFilter !== "all") q = q.eq("checked_in", checkInFilter === "true");
    return q;
  }, [searchQuery, levelFilter, transportFilter, checkInFilter]);

  const exportToCsv = useCallback(async () => {
    setExporting(true);
    try {
      const q = buildFilteredQuery();
      const { data: rows, error: err } = await q.range(0, 9999);
      if (err) throw err;
      const list = rows ?? [];
      const csvEscape = (v: unknown): string => {
        if (v == null) return "";
        const s = Array.isArray(v) ? v.join("; ") : String(v);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const headers = selectedColumns;
      const csvRows = [
        headers.join(","),
        ...list.map((r) =>
          headers.map((h) => {
            const val = r[h];
            return csvEscape(val);
          }).join(",")
        ),
      ];
      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${list.length} registration${list.length !== 1 ? "s" : ""} to CSV.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [buildFilteredQuery, selectedColumns]);

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
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Level of study</Label>
              <Select
                value={levelFilter}
                onValueChange={(v) =>
                  setSearchParams((prev) => {
                    const p = new URLSearchParams(prev);
                    if (v === "all") p.delete(PARAM_LEVEL);
                    else p.set(PARAM_LEVEL, v);
                    return p;
                  })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Airport transport</Label>
              <Select
                value={transportFilter}
                onValueChange={(v) =>
                  setSearchParams((prev) => {
                    const p = new URLSearchParams(prev);
                    if (v === "all") p.delete(PARAM_TRANSPORT);
                    else p.set(PARAM_TRANSPORT, v);
                    return p;
                  })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
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
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Check-in</Label>
              <Select
                value={checkInFilter}
                onValueChange={(v) =>
                  setSearchParams((prev) => {
                    const p = new URLSearchParams(prev);
                    if (v === "all") p.delete(PARAM_CHECK_IN);
                    else p.set(PARAM_CHECK_IN, v);
                    return p;
                  })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {CHECK_IN_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{total}</span>
            <span className="text-sm text-muted-foreground">
              {hasFilters ? "matching" : "total"} registration{total !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Columns className="h-4 w-4" />
                  Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="end">
                <p className="text-xs font-medium text-muted-foreground mb-2">Select fields to display (min 1)</p>
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {COLUMN_OPTIONS.map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={selectedColumns.includes(col.id)}
                        onCheckedChange={() => toggleColumn(col.id)}
                        disabled={selectedColumns.includes(col.id) && selectedColumns.length === 1}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCsv}
              disabled={loading || exporting}
              className="gap-2"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export CSV
            </Button>
            <AdminRegisterDialog onSuccess={fetchRegistrations} />
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
                {selectedColumns.map((colId) => {
                  const col = COLUMN_OPTIONS.find((c) => c.id === colId);
                  const isCheckIn = colId === "checked_in";
                  return (
                    <TableHead
                      key={colId}
                      className={`text-primary font-semibold ${isCheckIn ? "text-center w-[120px]" : ""}`}
                    >
                      {col?.label ?? colId}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r) => (
                <TableRow
                  key={r.id}
                  className="border-border cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedRegistration(r);
                    setDetailOpen(true);
                  }}
                >
                  {selectedColumns.map((colId) => {
                    const val = r[colId];
                    const isCheckIn = colId === "checked_in";
                    const isDate = colId === "checked_in_at" || colId === "created_at";
                    const isArray = Array.isArray(val);
                    let content: React.ReactNode;
                    if (isCheckIn) {
                      content = !!val ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <Circle className="h-3.5 w-3.5 shrink-0" />
                          No
                        </span>
                      );
                    } else if (isDate && val) {
                      content = format(new Date(val as string), "PPp");
                    } else if (isArray && val) {
                      content = (val as string[]).join(", ");
                    } else {
                      content = val != null && val !== "" ? String(val) : "—";
                    }
                    return (
                      <TableCell
                        key={colId}
                        className={colId === "email" ? "font-medium" : isCheckIn ? "text-center" : ""}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
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
        onRegistrationUpdated={(updated) => {
          setSelectedRegistration(updated);
          setData((prev) =>
            prev.map((row) => (row.id === updated.id ? updated : row))
          );
        }}
      />
    </div>
  );
};

export default RegistrationsTable;
