import { availableParallelism } from "node:os";

export const cpuCount = availableParallelism();

export default function (isEnabled = false, workers = 1) {
  if (!isEnabled) return 1;

  const desiredWorkers = Number.isInteger(workers) && workers > 0 ? workers : 1;

  return Math.min(desiredWorkers, Math.max(cpuCount, 1));
}
