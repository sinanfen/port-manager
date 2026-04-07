import { useEffect, useState } from "react";
import { RefreshCcw, Search, ShieldAlert } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { listen } from "@tauri-apps/api/event";
import { PortList } from "@/components/ports/port-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPorts,
  killProcess,
  openFolder,
  openInBrowser,
  openTerminal,
} from "@/features/ports/api";
import type { PortEntry } from "@/features/ports/types";
import { applyPortFilters } from "@/features/ports/selectors";
import { usePortFiltersStore } from "@/stores/port-filters";

export default function App() {
  const [actionError, setActionError] = useState<string | null>(null);
  const [killTarget, setKillTarget] = useState<PortEntry | null>(null);
  const query = useQuery({
    queryKey: ["ports"],
    queryFn: getPorts,
  });
  const killMutation = useMutation({
    mutationFn: ({ force, pid }: { force: boolean; pid: number }) => killProcess(pid, force),
    onSuccess: async () => {
      setKillTarget(null);
      setActionError(null);
      await query.refetch();
    },
  });

  const {
    search,
    protocol,
    listeningOnly,
    sortBy,
    sortDirection,
    setSearch,
    setProtocol,
    setListeningOnly,
    setSortBy,
    toggleSortDirection,
    reset,
  } = usePortFiltersStore();

  const ports = query.data ?? [];
  const filteredPorts = applyPortFilters(ports, {
    search,
    protocol,
    listeningOnly,
    sortBy,
    sortDirection,
  });

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;

    void listen("tray://refresh-ports", () => {
      void query.refetch();
    }).then((cleanup) => {
      if (disposed) {
        cleanup();
        return;
      }

      unlisten = cleanup;
    });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [query]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <header className="mb-8 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="overflow-hidden border-white/70 bg-white/75 backdrop-blur-lg">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(32,140,255,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(14,116,144,0.12),_transparent_45%)]" />
            <CardHeader className="relative">
              <Badge className="mb-3 w-fit">Windows MVP</Badge>
              <CardTitle className="text-4xl font-semibold tracking-tight text-slate-950">
                PortManager
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm text-slate-600">
                Inspect active localhost ports, match them to running processes, and understand
                your machine’s local service surface without leaving the desktop.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <Metric label="Visible ports" value={filteredPorts.length.toString()} />
              <Metric label="Total scanned" value={ports.length.toString()} />
              <Metric
                label="Accessible rows"
                value={ports.filter((entry) => entry.isAccessible).length.toString()}
              />
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-slate-950 text-slate-50 shadow-panel">
            <CardHeader>
              <CardTitle className="text-lg">Scan posture</CardTitle>
              <CardDescription className="text-slate-300">
                Best-effort Windows TCP discovery with graceful fallback for restricted processes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-300" />
                <p>
                  Protected or short-lived processes may appear with partial metadata instead of
                  failing the scan. That behavior is intentional for this first slice.
                </p>
              </div>
              <Button
                className="w-full"
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
              >
                <RefreshCcw className={query.isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
                Refresh ports
              </Button>
            </CardContent>
          </Card>
        </header>

        <section className="relative z-20 mb-6 grid gap-4 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-panel backdrop-blur lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="search">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="search"
                className="pl-9"
                placeholder="Search by port, PID, process name, path, or URL"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="protocol">
              Protocol
            </label>
            <Select
              id="protocol"
              value={protocol}
              onChange={(event) => setProtocol(event.target.value as "all" | "tcp" | "udp")}
            >
              <option value="all">All protocols</option>
              <option value="tcp">TCP only</option>
              <option value="udp">UDP only</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="sort-by">
              Sort by
            </label>
            <Select
              id="sort-by"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as "port" | "processName" | "pid")}
            >
              <option value="port">Port</option>
              <option value="processName">Process</option>
              <option value="pid">PID</option>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Filters</span>
            <label className="flex h-10 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700">
              <Checkbox
                checked={listeningOnly}
                onCheckedChange={(value) => setListeningOnly(value)}
              />
              Listening only
            </label>
          </div>

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={() => toggleSortDirection()}>
              {sortDirection === "asc" ? "Ascending" : "Descending"}
            </Button>
            <Button variant="ghost" onClick={() => reset()}>
              Reset
            </Button>
          </div>
        </section>

        <section className="relative z-0 flex-1 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-panel backdrop-blur">
          {actionError ? (
            <div className="mb-5 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              {actionError}
            </div>
          ) : null}

          {query.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : null}

          {query.isError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-900">
              <p className="font-medium">Port scan failed.</p>
              <p className="mt-2 text-rose-800">
                {query.error instanceof Error
                  ? query.error.message
                  : "The backend returned an unknown error."}
              </p>
            </div>
          ) : null}

          {!query.isLoading && !query.isError && filteredPorts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center text-sm text-slate-600">
              <p className="text-base font-medium text-slate-900">No matching ports found.</p>
              <p className="mt-2">
                Adjust the search or filters, or refresh the scan if a local service just started.
              </p>
            </div>
          ) : null}

          {!query.isLoading && !query.isError && filteredPorts.length > 0 ? (
            <PortList
              isActing={killMutation.isPending}
              isKillingPid={killMutation.isPending ? killTarget?.pid ?? null : null}
              onBrowserRequest={(entry) => {
                void runAction(async () => {
                  if (!entry.suggestedUrl) {
                    throw new Error("No suggested URL is available for this port.");
                  }

                  await openInBrowser(entry.suggestedUrl);
                }, setActionError);
              }}
              onFolderRequest={(entry) => {
                void runAction(
                  () => openFolder(entry.workingDirectory, entry.executablePath),
                  setActionError,
                );
              }}
              onKillRequest={(entry) => setKillTarget(entry)}
              onTerminalRequest={(entry) => {
                void runAction(
                  () => openTerminal(entry.workingDirectory, entry.executablePath),
                  setActionError,
                );
              }}
              ports={filteredPorts}
            />
          ) : null}
        </section>
      </div>

      {killTarget ? (
        <KillConfirmDialog
          entry={killTarget}
          errorMessage={killMutation.error instanceof Error ? killMutation.error.message : null}
          isPending={killMutation.isPending}
          onCancel={() => {
            if (!killMutation.isPending) {
              killMutation.reset();
              setKillTarget(null);
            }
          }}
          onConfirm={(force) => {
            if (!killTarget.pid) {
              return;
            }

            setActionError(null);
            killMutation.reset();
            killMutation.mutate({ force, pid: killTarget.pid });
          }}
        />
      ) : null}
    </main>
  );
}

async function runAction(action: () => Promise<void>, setActionError: (value: string | null) => void) {
  try {
    setActionError(null);
    await action();
  } catch (error) {
    setActionError(
      error instanceof Error ? error.message : "The requested action could not be completed.",
    );
  }
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

type KillConfirmDialogProps = {
  entry: PortEntry;
  errorMessage: string | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: (force: boolean) => void;
};

function KillConfirmDialog({
  entry,
  errorMessage,
  isPending,
  onCancel,
  onConfirm,
}: KillConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_32px_120px_rgba(15,23,42,0.28)]">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
            Confirm Action
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Kill this process?</h2>
          <p className="mt-3 text-sm text-slate-600">
            PortManager will run Windows <code>taskkill</code> for
            {" "}
            <span className="font-medium text-slate-900">
              {entry.processName ?? "Unknown process"}
            </span>
            {entry.pid ? ` (PID ${entry.pid})` : ""}.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            This can interrupt any service currently bound to port {entry.port}.
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <Button disabled={isPending} variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isPending} variant="secondary" onClick={() => onConfirm(false)}>
            End Process
          </Button>
          <Button disabled={isPending} onClick={() => onConfirm(true)}>
            {isPending ? "Running taskkill..." : "Force Kill"}
          </Button>
        </div>
      </div>
    </div>
  );
}
