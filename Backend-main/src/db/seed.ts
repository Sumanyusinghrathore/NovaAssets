import { getCollections } from "./collections";
import { db as mockDb } from "./mockDb";
import { normalizeRole } from "../rbac";
import { generateId } from "../utils/id";
import type { Notification } from "../types";

const DEMO_AUTH_EMAILS = new Set([
  "superadmin@oddo.com",
  "admin@oddo.com",
  "manager@oddo.com",
  "tl@oddo.com",
  "itservice@oddo.com",
  "employee@oddo.com",
]);

const DEMO_NOTIFICATIONS: Array<Notification> = [
  {
    id: "n-oddo-founder-ready",
    type: "user_registered",
    title: "Founder workspace is ready",
    body: "Super admin access, department views, and role permissions are synced from MongoDB.",
    entityType: "workspace",
    entityId: "founder",
    audienceRoles: ["Admin"],
    readBy: [],
    createdBy: "u-oddo-superadmin",
    createdAt: new Date(Date.now() - 1000 * 60 * 18),
  },
  {
    id: "n-oddo-manager-role",
    type: "user_registered",
    title: "Manager role mapped",
    body: "manager@oddo.com is linked to the Sales Manager workflow.",
    entityType: "user",
    entityId: "u-oddo-manager",
    audienceRoles: ["Admin"],
    readBy: [],
    createdBy: "u-oddo-superadmin",
    createdAt: new Date(Date.now() - 1000 * 60 * 46),
  },
  {
    id: "n-oddo-tl-access",
    type: "user_registered",
    title: "TL access prepared",
    body: "tl@oddo.com is available for technical team review and task routing.",
    entityType: "user",
    entityId: "u-oddo-tl",
    audienceRoles: ["Admin", "L2 Technical Team"],
    readBy: [],
    createdBy: "u-oddo-superadmin",
    createdAt: new Date(Date.now() - 1000 * 60 * 82),
  },
  {
    id: "n-oddo-it-service",
    type: "user_registered",
    title: "IT service account synced",
    body: "itservice@oddo.com is ready for support workflows.",
    entityType: "user",
    entityId: "u-oddo-itservice",
    audienceRoles: ["Admin", "L1 Engineer"],
    readBy: [],
    createdBy: "u-oddo-superadmin",
    createdAt: new Date(Date.now() - 1000 * 60 * 124),
  },
];

export async function syncDemoAuthUsers() {
  const c = await getCollections();
  const now = new Date();
  const demoUsers = mockDb.users.filter((user) => DEMO_AUTH_EMAILS.has(user.email.trim().toLowerCase()));

  if (!demoUsers.length) return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };

  const result = await c.users.bulkWrite(
    demoUsers.map((user) => {
      const email = user.email.trim().toLowerCase();
      const role = normalizeRole(user.role);
      return {
        updateOne: {
          filter: { email },
          update: {
            $set: {
              email,
              passwordHash: user.passwordHash,
              name: user.name,
              mobile: user.mobile,
              role,
              isActive: user.isActive,
              assignedStates: user.assignedStates ?? [],
              updatedAt: now,
            },
            $setOnInsert: {
              id: user.id,
              createdAt: user.createdAt ?? now,
            },
          },
          upsert: true,
        },
      };
    }),
    { ordered: false }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    upsertedCount: result.upsertedCount,
  };
}

export async function seedDatabaseIfEmpty() {
  const c = await getCollections();
  const initialUsersCount = await c.users.estimatedDocumentCount();
  await syncDemoAuthUsers();
  await syncDemoNotifications();

  const existingUsers = await c.users.find({}, { projection: { email: 1 } }).toArray();
  const existingEmails = new Set(existingUsers.map((u) => String((u as any).email || "").toLowerCase()));

  const usersToInsert = mockDb.users.filter((u) => !existingEmails.has(u.email.toLowerCase()));
  if (usersToInsert.length) await c.users.insertMany(usersToInsert);

  // Seed minimal baseline for first-time DB only (keep non-user collections stable).
  if (initialUsersCount === 0) {
    if (mockDb.customers.length) await c.customers.insertMany(mockDb.customers);
    if (mockDb.products.length) await c.products.insertMany(mockDb.products);
    if (mockDb.distributors.length) await c.distributors.insertMany(mockDb.distributors);
  }
}

export async function syncDemoNotifications() {
  const c = await getCollections();
  const now = new Date();
  const docs = DEMO_NOTIFICATIONS.map((notification, index) => ({
    ...notification,
    id: notification.id ?? generateId(),
    createdAt: new Date(now.getTime() - index * 1000 * 60 * 10),
  }));

  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { id: doc.id },
      update: { $set: doc },
      upsert: true,
    },
  }));

  if (!ops.length) return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };

  const result = await c.notifications.bulkWrite(ops, { ordered: false });
  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    upsertedCount: result.upsertedCount,
  };
}
