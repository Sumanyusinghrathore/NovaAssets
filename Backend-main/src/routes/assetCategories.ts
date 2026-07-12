import express, { type Request, type Response, type Router } from "express";

import { getCollections } from "../db/collections";
import { authenticate, requireAnyPermission } from "../middleware/auth";
import type { AssetCategory } from "../types";
import { fail, ok } from "../utils/http";
import { generateId } from "../utils/id";

const router: Router = express.Router();

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

router.get("/", authenticate, async (_req: Request, res: Response) => {
  const c = await getCollections();
  const data = await c.assetCategories.find({}).sort({ group: 1, name: 1 }).toArray();
  return ok(res, data);
});

router.post("/", authenticate, requireAnyPermission("dashboard:view", "users:manage", "roles:manage"), async (req: Request, res: Response) => {
  const name = normalizeText(req.body?.name);
  const group = normalizeText(req.body?.group) || "General";
  const icon = normalizeText(req.body?.icon) || "tag";
  const description = normalizeText(req.body?.description);
  const isActive = req.body?.isActive !== false;

  if (!name) {
    return fail(res, "Category name is required");
  }

  const c = await getCollections();
  const existing = await c.assetCategories.findOne({ name: new RegExp(`^${name}$`, "i") });
  if (existing) {
    return fail(res, "Category already exists");
  }

  const now = new Date();
  const doc: AssetCategory = {
    id: generateId(),
    name,
    group,
    icon,
    description: description || undefined,
    isActive: Boolean(isActive),
    createdAt: now,
    updatedAt: now,
  };

  await c.assetCategories.insertOne(doc);
  return ok(res, doc, 201);
});

router.patch("/:id", authenticate, requireAnyPermission("dashboard:view", "users:manage", "roles:manage"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const update: Partial<AssetCategory> = { updatedAt: new Date() };

  if (req.body?.name !== undefined) update.name = normalizeText(req.body.name);
  if (req.body?.group !== undefined) update.group = normalizeText(req.body.group) || "General";
  if (req.body?.icon !== undefined) update.icon = normalizeText(req.body.icon) || "tag";
  if (req.body?.description !== undefined) update.description = normalizeText(req.body.description) || undefined;
  if (req.body?.isActive !== undefined) update.isActive = Boolean(req.body.isActive);

  const c = await getCollections();
  const result = await c.assetCategories.updateOne({ id }, { $set: update });
  if (!result.matchedCount) {
    return fail(res, "Category not found", 404);
  }

  const doc = await c.assetCategories.findOne({ id });
  return ok(res, doc);
});

router.delete("/:id", authenticate, requireAnyPermission("dashboard:view", "users:manage", "roles:manage"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const c = await getCollections();
  const result = await c.assetCategories.deleteOne({ id });
  if (!result.deletedCount) {
    return fail(res, "Category not found", 404);
  }
  return ok(res, { message: "Category deleted" });
});

export default router;
