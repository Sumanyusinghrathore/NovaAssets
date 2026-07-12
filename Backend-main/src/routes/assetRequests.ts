import express, { type Request, type Response, type Router } from "express";

import { getCollections } from "../db/collections";
import { authenticate, requireAnyPermission } from "../middleware/auth";
import type { AssetRequest } from "../types";
import { fail, ok } from "../utils/http";
import { generateId } from "../utils/id";

const router: Router = express.Router();

const DEFAULT_ITEM_CATEGORY: Record<string, string> = {
  chair: "Furniture",
  "office chair": "Furniture",
  cpu: "Electronics",
  laptop: "Electronics",
  monitor: "Electronics",
  keyboard: "Electronics",
  mouse: "Electronics",
  printer: "Electronics",
  desk: "Furniture",
  table: "Furniture",
  "office table": "Furniture",
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function inferCategory(itemName: string) {
  return DEFAULT_ITEM_CATEGORY[itemName.trim().toLowerCase()] ?? "General";
}

/** POST /api/asset-requests */
router.post("/", authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as { userId: string; name?: string; email: string; role: string };
  const itemName = normalizeText(req.body?.itemName);
  const quantity = Number(req.body?.quantity ?? 1);
  const purpose = normalizeText(req.body?.purpose);
  const location = normalizeText(req.body?.location);
  const category = normalizeText(req.body?.category) || inferCategory(itemName);

  if (!itemName) {
    return fail(res, "Asset name is required");
  }

  if (!Number.isFinite(quantity) || quantity < 1) {
    return fail(res, "Quantity must be at least 1");
  }

  const c = await getCollections();
  const now = new Date();
  const doc: AssetRequest = {
    id: generateId(),
    requesterId: user.userId,
    requesterName: user.name ?? user.email,
    requesterEmail: user.email,
    requesterRole: user.role,
    itemName,
    category,
    quantity: Math.floor(quantity),
    purpose: purpose || undefined,
    location: location || undefined,
    status: "Pending",
    createdAt: now,
    updatedAt: now,
  };

  await c.assetRequests.insertOne(doc);
  return ok(res, doc, 201);
});

/** GET /api/asset-requests/mine */
router.get("/mine", authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as { userId: string };
  const c = await getCollections();
  const data = await c.assetRequests
    .find({ requesterId: user.userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  return ok(res, data);
});

/** GET /api/asset-requests */
router.get("/", authenticate, requireAnyPermission("users:manage", "roles:manage", "dashboard:view"), async (_req: Request, res: Response) => {
  const c = await getCollections();
  const data = await c.assetRequests.find({}).sort({ createdAt: -1 }).limit(100).toArray();
  return ok(res, data);
});

export default router;
