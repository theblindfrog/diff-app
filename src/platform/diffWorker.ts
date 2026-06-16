import DiffsWorker from "@pierre/diffs/worker/worker.js?worker";

/** Spawns a bundled @pierre/diffs render worker (Shiki highlighting off the main thread). */
export const createDiffWorker = (): Worker => new DiffsWorker();
