import { bootstrap } from "./bootstrap";
import { worker } from "./mocks/browser";

async function bootstrapE2E() {
  await worker.start({ onUnhandledRequest: "bypass" });
  await bootstrap();
}

void bootstrapE2E();
