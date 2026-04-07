import type { PortEntry, PortFilters } from "./types";

export function applyPortFilters(entries: PortEntry[], filters: PortFilters): PortEntry[] {
  const searchValue = filters.search.trim().toLowerCase();

  const filtered = entries.filter((entry) => {
    if (filters.protocol !== "all" && entry.protocol !== filters.protocol) {
      return false;
    }

    if (filters.listeningOnly && !entry.isListening) {
      return false;
    }

    if (searchValue.length === 0) {
      return true;
    }

    const haystack = [
      entry.port.toString(),
      entry.pid?.toString() ?? "",
      entry.processName ?? "",
      entry.executablePath ?? "",
      entry.suggestedUrl ?? "",
      entry.host,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(searchValue);
  });

  return filtered.sort((left, right) => {
    const direction = filters.sortDirection === "asc" ? 1 : -1;

    if (filters.sortBy === "port") {
      return (left.port - right.port) * direction;
    }

    if (filters.sortBy === "pid") {
      return ((left.pid ?? 0) - (right.pid ?? 0)) * direction;
    }

    return (left.processName ?? "").localeCompare(right.processName ?? "") * direction;
  });
}

