import { availableParallelism } from "node:os";

export const cpuCount = availableParallelism();

export default function getWorkerCount(
  configuredWorkers = process.env.CLUSTER_WORKERS,
) {
  const requestedWorkers = Number(configuredWorkers);
  if (!Number.isInteger(requestedWorkers) || requestedWorkers < 1) {
    return 1;
  }

  return Math.min(requestedWorkers, cpuCount);
}
