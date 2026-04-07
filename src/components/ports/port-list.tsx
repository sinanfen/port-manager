import * as React from "react";
import {
  ExternalLink,
  FolderOpen,
  Lock,
  MoreHorizontal,
  Shield,
  TerminalSquare,
  Trash2,
  Wifi,
} from "lucide-react";
import type { PortEntry } from "@/features/ports/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PortListProps = {
  isActing: boolean;
  isKillingPid?: number | null;
  onBrowserRequest: (entry: PortEntry) => void;
  onFolderRequest: (entry: PortEntry) => void;
  onKillRequest: (entry: PortEntry) => void;
  onTerminalRequest: (entry: PortEntry) => void;
  ports: PortEntry[];
};

export function PortList({
  isActing,
  isKillingPid = null,
  onBrowserRequest,
  onFolderRequest,
  onKillRequest,
  onTerminalRequest,
  ports,
}: PortListProps) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="w-full overflow-x-auto overflow-y-visible">
      <Table className="min-w-[980px] table-fixed xl:min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Port</TableHead>
            <TableHead className="w-[110px]">Protocol</TableHead>
            <TableHead className="w-[210px]">Process</TableHead>
            <TableHead className="w-[70px]">PID</TableHead>
            <TableHead className="w-[120px]">Host</TableHead>
            <TableHead className="w-[260px]">Executable Path</TableHead>
            <TableHead className="w-[170px]">Reachability</TableHead>
            <TableHead className="w-[96px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ports.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="w-[160px]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-slate-950">
                    <span>{entry.port}</span>
                    {entry.isListening ? <Badge variant="success">Listening</Badge> : null}
                  </div>
                  {entry.suggestedUrl ? (
                    <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="truncate">{entry.suggestedUrl}</span>
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="w-[110px]">
                <Badge variant={entry.protocol === "tcp" ? "default" : "secondary"}>
                  {entry.protocol.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="w-[210px]">
                <div className="space-y-1 overflow-hidden">
                  <p className="truncate font-medium text-slate-900">
                    {entry.processName ?? "Unknown process"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{(entry.classification ?? "unknown").toUpperCase()}</Badge>
                    {entry.requiresElevation ? (
                      <Badge variant="warning">
                        <Lock className="mr-1 h-3 w-3" />
                        Elevation
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-[70px]">{entry.pid ?? "N/A"}</TableCell>
              <TableCell className="w-[120px] font-mono text-xs text-slate-600">
                <span className="block truncate">{entry.host}</span>
              </TableCell>
              <TableCell className="w-[260px] text-xs text-slate-600">
                <span className="block truncate">{entry.executablePath ?? "Unavailable"}</span>
              </TableCell>
              <TableCell className="w-[170px]">
                <div className="flex items-center gap-2 text-sm">
                  {entry.isAccessible ? (
                    <>
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <span className="text-slate-700">Metadata available</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4 text-amber-600" />
                      <span className="text-slate-700">Partial metadata</span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="w-[96px] text-right">
                <RowActionsMenu
                  entry={entry}
                  isActing={isActing}
                  isKilling={isKillingPid === entry.pid}
                  onBrowserRequest={onBrowserRequest}
                  onFolderRequest={onFolderRequest}
                  onKillRequest={onKillRequest}
                  onTerminalRequest={onTerminalRequest}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

type RowActionsMenuProps = {
  entry: PortEntry;
  isActing: boolean;
  isKilling: boolean;
  onBrowserRequest: (entry: PortEntry) => void;
  onFolderRequest: (entry: PortEntry) => void;
  onKillRequest: (entry: PortEntry) => void;
  onTerminalRequest: (entry: PortEntry) => void;
};

function RowActionsMenu({
  entry,
  isActing,
  isKilling,
  onBrowserRequest,
  onFolderRequest,
  onKillRequest,
  onTerminalRequest,
}: RowActionsMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative flex justify-end" ref={containerRef}>
      <Button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Open actions for port ${entry.port}`}
        className="h-10 w-10 rounded-full px-0 py-0"
        variant="ghost"
        onClick={() => setIsOpen((current) => !current)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen ? (
        <div
          className="absolute right-0 top-[calc(100%+0.35rem)] z-50 min-w-[220px] rounded-[22px] border border-slate-200 bg-white/95 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur"
          role="menu"
        >
          <div className="space-y-1">
            <MenuAction
              disabled={!entry.suggestedUrl || isActing}
              icon={ExternalLink}
              label="Open in browser"
              onSelect={() => {
                setIsOpen(false);
                onBrowserRequest(entry);
              }}
            />
            <MenuAction
              disabled={(!entry.workingDirectory && !entry.executablePath) || isActing}
              icon={FolderOpen}
              label="Open folder"
              onSelect={() => {
                setIsOpen(false);
                onFolderRequest(entry);
              }}
            />
            <MenuAction
              disabled={(!entry.workingDirectory && !entry.executablePath) || isActing}
              icon={TerminalSquare}
              label="Open terminal"
              onSelect={() => {
                setIsOpen(false);
                onTerminalRequest(entry);
              }}
            />
            <MenuAction
              disabled={!entry.pid || isKilling}
              icon={Trash2}
              intent="danger"
              label={isKilling ? "Stopping..." : "Kill process"}
              onSelect={() => {
                setIsOpen(false);
                onKillRequest(entry);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

type MenuActionProps = {
  disabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
  intent?: "default" | "danger";
  label: string;
  onSelect: () => void;
};

function MenuAction({
  disabled,
  icon: Icon,
  intent = "default",
  label,
  onSelect,
}: MenuActionProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition",
        disabled
          ? "cursor-not-allowed text-slate-300"
          : "hover:bg-slate-100",
        intent === "danger" && !disabled
          ? "text-rose-700 hover:bg-rose-50"
          : "text-slate-700",
      )}
      disabled={disabled}
      role="menuitem"
      type="button"
      onClick={onSelect}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
