# Banafsh for Windows

Windows desktop client for Banafsh SSTP.

## 0.1.3 changes
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
- Server sorting is Healthy first, then higher published Mbps, then lower measured latency; failed servers go last.
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
