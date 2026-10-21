# Banafsh

Windows desktop client for Banafsh.

## 0.1.13 changes
- Welcome window: replaced the banking tip with a security note (no sensitive logins such as banking, volunteer-run servers, honest note about server and project logs).

## 0.1.12 changes
- Added a Welcome window (same style as the close dialog) with a short guide, features and a banking note. It opens on first launch and any time from Settings > Guide.
- The build now produces two files: `Banafsh-<version>-portable.exe` (no install) and `Banafsh-<version>-setup.exe` (per-user installer with Start menu and desktop shortcuts).

## 0.1.11 changes
- Settings changed by the app itself (failover server, remembered close choice) are pushed to the window, so a later save can no longer overwrite them.
- Tray Connect/Disconnect now checks the live connection state instead of a cached one.
- Fixed the elevated relaunch race: the single-instance lock is released before the Administrator copy starts, and the non-admin copy exits without touching the VPN.
- Tray icon is now 32 px; removed the unused tray popup files.

## 0.1.10 changes
- Replaced the native Windows title bar with a themed Banafsh title bar and custom minimize/close controls.
- Startup progress now remains visible briefly instead of flashing away immediately on fast systems.
- Server list is restricted to port 443 only.
- Server ordering now prioritizes ping first, then published bandwidth/speed.
- Server cards explicitly label `Ping` and `Speed`.

## 0.1.9 changes
- Renamed the Windows product/UI to `Banafsh`.
- Replaced the application, window and tray icon with the supplied shield/lock icon.
- Added a persistent Windows system tray with Open, Connect/Disconnect and Quit actions.
- Added single-click and double-click tray opening.
- Closing the window now asks whether to keep Banafsh in the tray or quit, even when the VPN is disconnected; the choice can be remembered.
- Added close-behavior settings: Ask, Keep in tray, or Disconnect and quit.
- Added automatic reconnect with configurable attempts and delay, including healthy-server failover.
- Reconnect UI now reports attempts, switching servers, and failure states.
- Kept reconnect-on-start as an optional setting and disabled it by default.
- Server testing is lazy: the list is downloaded during startup, while the full automatic health test runs when the Server list is opened, reducing startup work.
- Server sorting is Healthy first, then lower measured ping, then higher published Mbps; failed servers go last.
- Server cards show published Mbps beside ping.
- Added a `Test all` button.
- Added a collapsed Advanced > Log section.
- Added hover/press depth and motion to buttons, navigation, settings and server rows.
- Preserved the existing no-VPN site routing behavior.

## Build
```bash
npm install
npm run dist
```

- Keeps only port 443 servers in the list because Banafsh uses Windows SSTP on the standard SSTP/HTTPS port.
- Prevents intentional disconnects during server switching from triggering an extra reconnect.
- Merges settings updates so remembered close behavior and failover server choices are not overwritten by stale renderer state.
- Startup progress state is retained until the renderer is ready, so a fast 100% event cannot get lost.
- Reconnect can be cancelled from the main connection button.
- Uses `rasdial` for periodic connection-state checks instead of PowerShell.
