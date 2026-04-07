import type { PortEntry } from "./types";
import { invokeCommand } from "@/lib/tauri";

export async function getPorts(): Promise<PortEntry[]> {
  return invokeCommand<PortEntry[]>("get_ports");
}

export async function killProcess(pid: number, force = false): Promise<void> {
  return invokeCommand<void>("kill_process", { pid, force });
}

export async function openInBrowser(url: string): Promise<void> {
  return invokeCommand<void>("open_in_browser", { url });
}

export async function openFolder(
  workingDirectory?: string | null,
  executablePath?: string | null,
): Promise<void> {
  return invokeCommand<void>("open_folder", {
    executablePath,
    workingDirectory,
  });
}

export async function openTerminal(
  workingDirectory?: string | null,
  executablePath?: string | null,
): Promise<void> {
  return invokeCommand<void>("open_terminal", {
    executablePath,
    workingDirectory,
  });
}
