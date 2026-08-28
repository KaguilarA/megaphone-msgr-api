import cluster from "node:cluster";
import { ClusterEnabled } from "./consts/index.js";
import init from "./utils/init.js";
import getWorkerCount, { cpuCount } from "./utils/workerCount.js";

if (ClusterEnabled && cluster.isPrimary) {
  const workerCount = getWorkerCount();

  console.log(`[Primary] Master PID: ${process.pid} iniciado.`);
  console.log(
    `[Primary] Desplegando ${workerCount} worker(s) en ${cpuCount} núcleo(s) disponibles...\n`,
  );

  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `⚠️ [Primary] El worker ${worker.process.pid} murió (código: ${code}, señal: ${signal}). Levantando un reemplazo...`,
    );
    cluster.fork();
  });
} else {
  init();
}