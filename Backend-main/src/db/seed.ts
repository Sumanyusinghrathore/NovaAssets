import { getCollections } from "./collections";
import { db as mockDb } from "./mockDb";
import { normalizeRole } from "../rbac";
import { generateId } from "../utils/id";
import type { AssetCategory, AssetRequest, Notification } from "../types";

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

const DEMO_ASSET_REQUESTS: Array<AssetRequest> = [
  {
    id: "ar-employee-office-chair",
    requesterId: "u-oddo-employee",
    requesterName: "Employee User",
    requesterEmail: "employee@oddo.com",
    requesterRole: "Dealer",
    itemName: "Office Chair",
    category: "Furniture",
    quantity: 1,
    purpose: "Ergonomic seating for daily workstation use.",
    location: "Employee workstation",
    status: "Approved",
    createdAt: new Date(Date.now() - 1000 * 60 * 42),
    updatedAt: new Date(Date.now() - 1000 * 60 * 40),
  },
  {
    id: "ar-employee-cpu",
    requesterId: "u-oddo-employee",
    requesterName: "Employee User",
    requesterEmail: "employee@oddo.com",
    requesterRole: "Dealer",
    itemName: "CPU Tower",
    category: "Electronics",
    quantity: 1,
    purpose: "Main desk unit for local work setup.",
    location: "Employee workstation",
    status: "Pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 118),
    updatedAt: new Date(Date.now() - 1000 * 60 * 118),
  },
  {
    id: "ar-manager-monitor",
    requesterId: "u-oddo-manager",
    requesterName: "Manager User",
    requesterEmail: "manager@oddo.com",
    requesterRole: "Sales Manager",
    itemName: "Monitor",
    category: "Electronics",
    quantity: 2,
    purpose: "Dual-screen setup for team coordination.",
    location: "Manager cabin",
    status: "Fulfilled",
    createdAt: new Date(Date.now() - 1000 * 60 * 240),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180),
  },
];

const DEMO_ASSET_CATEGORIES: Array<AssetCategory> = [
  { id: "cat-electronics", name: "Electronics", group: "Core Assets", icon: "laptop", description: "Computers, peripherals, and office tech.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "cat-furniture", name: "Furniture", group: "Workspace", icon: "chair", description: "Desks, chairs, and meeting furniture.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "cat-networking", name: "Networking", group: "Infrastructure", icon: "network", description: "Routers, switches, and connectivity gear.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "cat-security", name: "Security", group: "Infrastructure", icon: "shield", description: "CCTV, biometric, fire safety, and access control.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "cat-office-equipment", name: "Office Equipment", group: "Operations", icon: "printer", description: "Printers, scanners, projectors, and shared devices.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "cat-vehicles", name: "Vehicles", group: "Operations", icon: "vehicle", description: "Company cars and transport assets.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "cat-rooms", name: "Meeting Rooms", group: "Facilities", icon: "room", description: "Conference rooms and meeting spaces.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "cat-storage", name: "Storage", group: "Facilities", icon: "box", description: "Lockers, cabinets, and storage units.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
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
  await syncDemoAssetCategories();
  await syncDemoAssetRequests();

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

export async function syncDemoAssetCategories() {
  const c = await getCollections();
  const now = new Date();
  const docs = DEMO_ASSET_CATEGORIES.map((category, index) => ({
    ...category,
    id: category.id ?? generateId(),
    createdAt: new Date(now.getTime() - index * 1000 * 60 * 20),
    updatedAt: category.updatedAt ?? new Date(now.getTime() - index * 1000 * 60 * 15),
  }));

  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { id: doc.id },
      update: { $set: doc },
      upsert: true,
    },
  }));

  if (!ops.length) return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };

  const result = await c.assetCategories.bulkWrite(ops, { ordered: false });
  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    upsertedCount: result.upsertedCount,
  };
}

export async function syncDemoAssetRequests() {
  const c = await getCollections();
  const now = new Date();
  const docs = DEMO_ASSET_REQUESTS.map((request, index) => ({
    ...request,
    id: request.id ?? generateId(),
    createdAt: new Date(now.getTime() - index * 1000 * 60 * 15),
    updatedAt: request.updatedAt ?? new Date(now.getTime() - index * 1000 * 60 * 10),
  }));

  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { id: doc.id },
      update: { $set: doc },
      upsert: true,
    },
  }));

  if (!ops.length) return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };

  const result = await c.assetRequests.bulkWrite(ops, { ordered: false });
  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    upsertedCount: result.upsertedCount,
  };
}
