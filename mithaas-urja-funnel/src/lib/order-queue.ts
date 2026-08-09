import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type QueuedOrder = {
  orderId: string;
  createdAt: string;
  reason: string;
  payload: Record<string, unknown>;
};

const queueDir = path.join(process.cwd(), ".data");
const queueFile = path.join(queueDir, "pending-orders.json");

async function readQueue(): Promise<QueuedOrder[]> {
  try {
    const raw = await readFile(queueFile, "utf8");
    const parsed = JSON.parse(raw) as QueuedOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function queueOrder(orderId: string, reason: string, payload: Record<string, unknown>) {
  await mkdir(queueDir, { recursive: true });
  const currentQueue = await readQueue();
  currentQueue.push({
    orderId,
    createdAt: new Date().toISOString(),
    reason,
    payload,
  });
  await writeFile(queueFile, JSON.stringify(currentQueue, null, 2), "utf8");

  return {
    queueFile,
    queuedCount: currentQueue.length,
  };
}
