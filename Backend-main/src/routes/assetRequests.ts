import express, { type Request, type Response, type Router } from "express";

import { getCollections } from "../db/collections";
import { authenticate } from "../middleware/auth";
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

function isManager(user: { role: string }) {
  const role = user.role.trim().toLowerCase();
  return role === "admin" || role === "manager" || role === "sales" || role === "sales manager" || role === "asset manager";
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
  await c.notifications.insertOne({
    id: generateId(),
    type: "user_registered",
    title: "New asset request",
    body: `${doc.requesterName} requested ${doc.itemName} (${doc.quantity}x ${doc.category}).`,
    entityType: "asset-request",
    entityId: doc.id,
    meta: {
      requestId: doc.id,
      requesterId: doc.requesterId,
      requesterName: doc.requesterName,
      itemName: doc.itemName,
      category: doc.category,
      quantity: doc.quantity,
    },
    audienceRoles: ["Manager", "Admin", "Sales"],
    readBy: [],
    createdBy: user.userId,
    createdAt: now,
  });
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
router.get("/", authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as { userId: string; role: string };
  const c = await getCollections();
  const filter = isManager(user) ? {} : { requesterId: user.userId };
  const data = await c.assetRequests.find(filter).sort({ createdAt: -1 }).limit(100).toArray();
  return ok(res, data);
});

/** POST /api/asset-requests/:id/approve */
router.post("/:id/approve", authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as { userId: string; name?: string; email: string; role: string };
  if (!isManager(user)) {
    return fail(res, "Access denied: manager approval required", 403);
  }

  const { id } = req.params;
  const c = await getCollections();
  const request = await c.assetRequests.findOne({ id });
  if (!request) return fail(res, "Asset request not found", 404);
  if (request.status === "Rejected") return fail(res, "Request has already been rejected");
  if (request.status === "Fulfilled") return fail(res, "Request has already been fulfilled");
  if (request.status === "Approved") {
    return ok(res, request);
  }

  const now = new Date();
  const updated: AssetRequest = {
    ...request,
    status: "Approved",
    approvedBy: user.name ?? user.email,
    approvedAt: now,
    updatedAt: now,
  };

  await c.assetRequests.updateOne(
    { id },
    {
      $set: {
        status: updated.status,
        approvedBy: updated.approvedBy,
        approvedAt: updated.approvedAt,
        updatedAt: updated.updatedAt,
      },
    }
  );

  await c.notifications.insertOne({
    id: generateId(),
    type: "user_registered",
    title: "Asset request approved",
    body: `${updated.itemName} (${updated.quantity}x) has been approved.`,
    entityType: "asset-request",
    entityId: updated.id,
    meta: {
      requestId: updated.id,
      requesterId: updated.requesterId,
      itemName: updated.itemName,
      category: updated.category,
      quantity: updated.quantity,
      approvedBy: updated.approvedBy,
    },
    audienceUserIds: [updated.requesterId],
    readBy: [],
    createdBy: user.userId,
    createdAt: now,
  });

  return ok(res, updated);
});

export default router;
