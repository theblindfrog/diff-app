import { ModeSwitcher } from "../toolbar/ModeSwitcher";
import { Toolbar } from "../toolbar/Toolbar";
import { Logo } from "./Logo";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-lead">
        <Logo className="app-logo" />
        <ModeSwitcher />
      </div>
      <Toolbar />
    </header>
  );
}
