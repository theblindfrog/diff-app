import { open } from "@tauri-apps/plugin-dialog";
import { isTauri } from "./env";

const FILTERS = [
  {
    name: "Text & Code",
    extensions: [
      "txt", "md", "json", "yaml", "yml", "toml", "xml", "csv",
      "ts", "tsx", "js", "jsx", "mjs", "cjs",
      "py", "rs", "go", "java", "kt", "swift", "rb", "php",
      "c", "h", "cpp", "hpp", "cc", "cs",
      "html", "css", "scss", "sql", "sh", "bash", "diff", "patch",
    ],
  },
  { name: "All Files", extensions: ["*"] },
];

/** Opens the native picker for a single file. Returns its path, or null. */
export async function pickFile(): Promise<string | null> {
  if (!isTauri) return null;
  const result = await open({ multiple: false, directory: false, filters: FILTERS });
  return typeof result === "string" ? result : null;
}

/** Opens the native picker allowing two files (for loading a pair at once). */
export async function pickFiles(): Promise<string[] | null> {
  if (!isTauri) return null;
  const result = await open({ multiple: true, directory: false, filters: FILTERS });
  return Array.isArray(result) ? result : null;
}
