# Active Context

## Current focus

Initial vertical MVP implementation is complete and verified. The active focus now shifts to exercising the app against real Windows process scenarios and preparing the next feature slice.

## Immediate goals

- Push the new release workflow and publish the first tagged GitHub Release with an MSI installer.
- Validate the live port scan, actions, tray behavior, and installer flow on Windows.
- Decide the next product slice after release enablement: settings UI, startup options, or details view.
- Keep the Memory Bank aligned with implementation changes.

## Working assumptions

- English will be used for code and Memory Bank documentation.
- The long-form `project-description.md` remains the source product brief for broader scope and roadmap items.
- CLI and desktop actions are deferred until the scan-to-UI loop is stable.
- The current desktop build target is `com.portmanager.desktop`.
- The app now includes a custom icon set and Windows system tray integration.
- GitHub release publishing is tag-driven using `v*` tags and a Windows-only release workflow.
