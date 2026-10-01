import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import { OwlClusterWorkerCount } from "owl-expressjs-utils";
import { ClusterEnabled, ClusterWorkers } from "./consts/index.js";
import init from "./utils/init.js";

if (ClusterEnabled && cluster.isPrimary) {
  const workerCount = OwlClusterWorkerCount(ClusterEnabled, ClusterWorkers);

  console.log(`[Primary] Master PID: ${process.pid} iniciado.`);
  console.log(
    `[Primary] Desplegando ${workerCount} worker(s) en ${availableParallelism()} núcleo(s) disponibles...\n`,
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