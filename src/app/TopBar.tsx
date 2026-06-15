import { ModeSwitcher } from "../toolbar/ModeSwitcher";
import { Toolbar } from "../toolbar/Toolbar";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-lead">
        <span className="app-title">Differ</span>
        <ModeSwitcher />
      </div>
      <Toolbar />
    </header>
  );
}
