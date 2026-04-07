import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortList } from "./port-list";
import type { PortEntry } from "@/features/ports/types";

const ports: PortEntry[] = [
  {
    id: "tcp-3000-101",
    port: 3000,
    protocol: "tcp",
    host: "127.0.0.1",
    isListening: true,
    suggestedUrl: "http://127.0.0.1:3000",
    pid: 101,
    processName: "node",
    executablePath: "C:\\node.exe",
    workingDirectory: "C:\\apps\\web",
    commandLine: "node server.js",
    classification: "node",
    isAccessible: true,
    requiresElevation: false,
  },
];

describe("PortList", () => {
  it("renders scanned process details", async () => {
    const user = userEvent.setup();

    render(
      <PortList
        isActing={false}
        onBrowserRequest={() => undefined}
        onFolderRequest={() => undefined}
        onKillRequest={() => undefined}
        onTerminalRequest={() => undefined}
        ports={ports}
      />,
    );

    expect(screen.getByText("3000")).toBeInTheDocument();
    expect(screen.getByText("node")).toBeInTheDocument();
    expect(screen.getByText("Metadata available")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open actions for port 3000" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Open folder" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Kill process" })).toBeInTheDocument();
  });
});
