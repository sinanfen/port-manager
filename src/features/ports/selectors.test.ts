import { applyPortFilters } from "./selectors";
import type { PortEntry } from "./types";

const entries: PortEntry[] = [
  {
    id: "tcp-3000-1",
    port: 3000,
    protocol: "tcp",
    host: "127.0.0.1",
    isListening: true,
    suggestedUrl: "http://127.0.0.1:3000",
    pid: 100,
    processName: "node",
    executablePath: "C:\\node.exe",
    workingDirectory: null,
    commandLine: null,
    classification: "node",
    isAccessible: true,
    requiresElevation: false,
  },
  {
    id: "tcp-8080-2",
    port: 8080,
    protocol: "tcp",
    host: "127.0.0.1",
    isListening: false,
    suggestedUrl: null,
    pid: 200,
    processName: "python",
    executablePath: "C:\\python.exe",
    workingDirectory: null,
    commandLine: null,
    classification: "python",
    isAccessible: true,
    requiresElevation: false,
  },
];

describe("applyPortFilters", () => {
  it("filters by listening state and search", () => {
    const result = applyPortFilters(entries, {
      search: "node",
      protocol: "all",
      listeningOnly: true,
      sortBy: "port",
      sortDirection: "asc",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.port).toBe(3000);
  });

  it("sorts by pid descending", () => {
    const result = applyPortFilters(entries, {
      search: "",
      protocol: "all",
      listeningOnly: false,
      sortBy: "pid",
      sortDirection: "desc",
    });

    expect(result[0]?.pid).toBe(200);
  });
});

