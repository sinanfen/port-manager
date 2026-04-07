export type PortProtocol = "tcp" | "udp";

export type PortClassification = "native" | "node" | "python" | "database" | "unknown";

export type PortEntry = {
  id: string;
  port: number;
  protocol: PortProtocol;
  host: string;
  isListening: boolean;
  suggestedUrl?: string | null;
  pid?: number | null;
  processName?: string | null;
  executablePath?: string | null;
  workingDirectory?: string | null;
  commandLine?: string | null;
  classification?: PortClassification | null;
  isAccessible: boolean;
  requiresElevation: boolean;
};

export type PortFilters = {
  search: string;
  protocol: "all" | PortProtocol;
  listeningOnly: boolean;
  sortBy: "port" | "processName" | "pid";
  sortDirection: "asc" | "desc";
};

