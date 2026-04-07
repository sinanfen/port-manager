import { create } from "zustand";
import type { PortFilters } from "@/features/ports/types";

type PortFiltersState = PortFilters & {
  setSearch: (value: string) => void;
  setProtocol: (value: PortFilters["protocol"]) => void;
  setListeningOnly: (value: boolean) => void;
  setSortBy: (value: PortFilters["sortBy"]) => void;
  toggleSortDirection: () => void;
  reset: () => void;
};

const defaults: PortFilters = {
  search: "",
  protocol: "all",
  listeningOnly: true,
  sortBy: "port",
  sortDirection: "asc",
};

export const usePortFiltersStore = create<PortFiltersState>((set) => ({
  ...defaults,
  setSearch: (value) => set({ search: value }),
  setProtocol: (value) => set({ protocol: value }),
  setListeningOnly: (value) => set({ listeningOnly: value }),
  setSortBy: (value) => set({ sortBy: value }),
  toggleSortDirection: () =>
    set((state) => ({
      sortDirection: state.sortDirection === "asc" ? "desc" : "asc",
    })),
  reset: () => set(defaults),
}));

