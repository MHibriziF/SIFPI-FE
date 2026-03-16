// Module-level store — survives client-side navigation, cleared on page refresh.
// Page refresh also kills in-flight fetches, so no inconsistency.

export type ImportProgressState =
  | { status: 'running'; done: number; total: number; sourceFileName: string }
  | { status: 'completed'; totalSuccess: number; totalFailed: number; hadErrors: boolean }
  | null;

let state: ImportProgressState = null;
const listeners = new Set<(s: ImportProgressState) => void>();

export function getImportProgressState(): ImportProgressState {
  return state;
}

export function setImportProgressState(next: ImportProgressState): void {
  state = next;
  listeners.forEach(l => l(next));
}

export function subscribeImportProgress(fn: (s: ImportProgressState) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
