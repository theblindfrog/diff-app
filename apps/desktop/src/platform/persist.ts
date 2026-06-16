import { load, type Store } from "@tauri-apps/plugin-store";
import { isTauri } from "./env";
import type { Layout, Mode, RecentPair, ThemeType } from "../types";

export interface PersistedSettings {
  mode: Mode;
  layout: Layout;
  themeType: ThemeType;
  wordWrap: boolean;
  languageOverride: string | null;
  topPaneHeight: number;
  recentPairs: RecentPair[];
}

const STORE_FILE = "settings.json";
const STORE_KEY = "settings";
const LS_KEY = "differ-settings";

let storePromise: Promise<Store> | null = null;
function getStore(): Promise<Store> {
  if (!storePromise) storePromise = load(STORE_FILE, { defaults: {}, autoSave: true });
  return storePromise;
}

export async function loadSettings(): Promise<Partial<PersistedSettings>> {
  try {
    if (isTauri) {
      const store = await getStore();
      return (await store.get<PersistedSettings>(STORE_KEY)) ?? {};
    }
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");
  } catch (err) {
    console.error("Failed to load settings", err);
    return {};
  }
}

export async function saveSettings(settings: PersistedSettings): Promise<void> {
  try {
    if (isTauri) {
      const store = await getStore();
      await store.set(STORE_KEY, settings);
    } else {
      localStorage.setItem(LS_KEY, JSON.stringify(settings));
    }
  } catch (err) {
    console.error("Failed to save settings", err);
  }
}
