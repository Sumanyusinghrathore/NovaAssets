"use client";

import { useEffect, useMemo, useState } from "react";
import { listNotifications, listRoles, listUsers, getUnreadNotificationCount, type NotificationItem, type RoleConfig, type UserSafe } from "@/app/lib/imsApi";
import { ROLE_LABELS, type AssetFlowRole, type AssetFlowSection } from "@/app/lib/assetflow-roles";
import SectionPanel from "./cards/SectionPanel";

type Props = {
  role: AssetFlowRole;
  section: AssetFlowSection;
  title: string;
  subtitle: string;
};

type RoleGroup = {
  key: string;
  label: string;
  count: number;
  active: number;
  sample: UserSafe[];
};

const DEMO_EMAIL_LABELS: Record<string, string> = {
  "superadmin@oddo.com": "Founder / Super Admin",
  "manager@oddo.com": "Manager",
  "tl@oddo.com": "TL",
  "itservice@oddo.com": "IT Service",
  "employee@oddo.com": "Employee",
};

function prettyRole(role: string) {
  return DEMO_EMAIL_LABELS[role.toLowerCase()] ?? role;
}

function timeAgo(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function numberFormat(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function buildGroups(users: UserSafe[]) {
  const map = new Map<string, RoleGroup>();
  for (const user of users) {
    const key = (user.role || "Unassigned").trim() || "Unassigned";
    const current = map.get(key) ?? { key, label: prettyRole(key), count: 0, active: 0, sample: [] };
    current.count += 1;
    if (user.isActive !== false) current.active += 1;
    if (current.sample.length < 3) current.sample.push(user);
    map.set(key, current);
  }

  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function demoAccessUsers(users: UserSafe[]) {
  return Object.entries(DEMO_EMAIL_LABELS)
    .map(([email, label]) => {
      const match = users.find((user) => user.email.toLowerCase() === email);
      return match ? { ...match, label } : null;
    })
    .filter(Boolean) as Array<UserSafe & { label: string }>;
}

function metricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{hint}</div>
    </div>
  );
}

export default function MongoWorkspacePage({ role, section, title, subtitle }: Props) {
  const [users, setUsers] = useState<UserSafe[]>([]);
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const canLoadUserData = role === "founder" || role === "admin";
        const requests: Promise<unknown>[] = [getUnreadNotificationCount(), listNotifications({ page: 1, limit: 8 })];

        if (canLoadUserData) {
          requests.push(listUsers(), listRoles());
        }

        const results = await Promise.all(requests);
        if (!alive) return;

        const [count, notificationPage, userData, roleData] = results as [
          number,
          { data: NotificationItem[] },
          UserSafe[] | undefined,
          RoleConfig[] | undefined,
        ];

        setUnreadCount(count);
        setNotifications(notificationPage.data ?? []);
        if (userData) setUsers(userData);
        if (roleData) setRoles(roleData);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Failed to load Mongo data.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [role, section]);

  const groups = useMemo(() => buildGroups(users), [users]);
  const demoUsers = useMemo(() => demoAccessUsers(users), [users]);
  const activeUsers = users.filter((user) => user.isActive !== false).length;
  const systemRoles = roles.filter((item) => item.isSystem).length;

  const heroStats = useMemo(() => {
    if (section === "roles-permissions") {
      return [
        { label: "Roles", value: numberFormat(roles.length), hint: `${systemRoles} system roles` },
        { label: "Permissions", value: numberFormat(new Set(roles.flatMap((item) => item.permissions)).size), hint: "Unique permissions in MongoDB" },
        { label: "Users", value: numberFormat(users.length), hint: `${activeUsers} active accounts` },
        { label: "Alerts", value: numberFormat(unreadCount), hint: "Unread notifications" },
      ];
    }

    if (section === "employees") {
      return [
        { label: "Employees", value: numberFormat(users.length), hint: `${activeUsers} active accounts` },
        { label: "Roles", value: numberFormat(roles.length), hint: `${systemRoles} system roles` },
        { label: "Demo logins", value: numberFormat(demoUsers.length), hint: "Founder, manager, TL, IT service, employee" },
        { label: "Alerts", value: numberFormat(unreadCount), hint: "Unread notifications" },
      ];
    }

    if (section === "departments") {
      return [
        { label: "Departments", value: numberFormat(groups.length), hint: "Role groups from MongoDB users" },
        { label: "Employees", value: numberFormat(users.length), hint: `${activeUsers} active accounts` },
        { label: "Demo accounts", value: numberFormat(demoUsers.length), hint: "ODDO login entries" },
        { label: "Alerts", value: numberFormat(unreadCount), hint: "Unread notifications" },
      ];
    }

    return [
      { label: "Employees", value: numberFormat(users.length), hint: `${activeUsers} active accounts` },
      { label: "Roles", value: numberFormat(roles.length), hint: `${systemRoles} system roles` },
      { label: "Departments", value: numberFormat(groups.length), hint: "Derived from role buckets" },
      { label: "Alerts", value: numberFormat(unreadCount), hint: "Unread notifications" },
    ];
  }, [activeUsers, demoUsers.length, groups.length, unreadCount, users.length, roles.length, section, systemRoles]);

  return (
    <section className="glass-panel soft-shadow rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5b3df5]/20 bg-[#5b3df5]/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#5b3df5]">
            Mongo live data
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Workspace</div>
          <div className="mt-1 text-sm font-bold text-slate-900">{ROLE_LABELS[role]}</div>
          <div className="text-xs text-slate-500">Synced from MongoDB</div>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        {heroStats.map((item) => (
          <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{item.label}</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900">{item.value}</div>
            <div className="mt-2 text-sm text-slate-500">{item.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionPanel
          title={section === "roles-permissions" ? "Permissions matrix" : section === "employees" ? "Employee roster" : section === "departments" ? "Department buckets" : "Recent activity"}
          subtitle={
            loading
              ? "Loading live data..."
              : section === "roles-permissions"
                ? "Roles and permissions are read from MongoDB."
                : section === "employees"
                  ? "Users are listed directly from MongoDB."
                  : section === "departments"
                    ? "Departments are derived from live user-role buckets."
                    : "Notifications are pulled from MongoDB."
          }
        >
          {loading ? (
            <div className="grid gap-3">
              <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
              <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
              <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
            </div>
          ) : section === "roles-permissions" ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="grid grid-cols-[1.3fr_0.9fr_0.8fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <div>Role</div>
                <div>Permissions</div>
                <div>Type</div>
              </div>
              <div className="divide-y divide-slate-200">
                {roles.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1.3fr_0.9fr_0.8fr] gap-4 px-4 py-4">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.name}</div>
                      <div className="mt-1 text-xs text-slate-500">Mongo role record</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.permissions.slice(0, 4).map((permission) => (
                        <span key={permission} className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-semibold text-[#5b3df5]">
                          {permission}
                        </span>
                      ))}
                      {item.permissions.length > 4 && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">+{item.permissions.length - 4} more</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">{item.isSystem ? "System" : "Custom"}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : section === "employees" ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="grid grid-cols-[1.1fr_1.1fr_0.9fr_0.7fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Status</div>
              </div>
              <div className="divide-y divide-slate-200">
                {users.map((user) => (
                  <div key={user.id} className="grid grid-cols-[1.1fr_1.1fr_0.9fr_0.7fr] gap-4 px-4 py-4">
                    <div className="text-sm font-bold text-slate-900">{user.name}</div>
                    <div className="break-all text-sm text-slate-600">{user.email}</div>
                    <div className="text-sm text-slate-600">{prettyRole(user.role)}</div>
                    <div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${user.isActive === false ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {user.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : section === "departments" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {groups.map((group) => (
                <div key={group.key} className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-500">Department</div>
                      <div className="mt-1 text-lg font-black text-slate-900">{group.label}</div>
                    </div>
                    <div className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold text-[#5b3df5]">
                      {group.count} users
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    {group.active} active, {Math.max(group.count - group.active, 0)} inactive
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.sample.map((user) => (
                      <span key={user.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {user.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {notifications.map((item) => (
                <div key={item.id} className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900">{item.title}</div>
                      {item.body && <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>}
                    </div>
                    <div className="shrink-0 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{timeAgo(item.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionPanel>

        <div className="grid gap-6">
          <SectionPanel title="Demo access" subtitle="Mongo-synced login identities">
            <div className="grid gap-3">
              {demoUsers.map((user) => (
                <div key={user.id} className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-slate-900">{user.label}</div>
                    <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-semibold text-[#5b3df5]">Demo</span>
                  </div>
                  <div className="mt-1 break-all text-sm text-slate-600">{user.email}</div>
                  <div className="mt-1 text-xs text-slate-500">{prettyRole(user.role)}</div>
                </div>
              ))}
            </div>
          </SectionPanel>

          <SectionPanel title="Live summary" subtitle="Real MongoDB snapshot">
            <div className="grid gap-3">
              <div className="rounded-[1.2rem] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Users</div>
                <div className="mt-1 text-2xl font-black text-slate-900">{numberFormat(users.length)}</div>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Roles</div>
                <div className="mt-1 text-2xl font-black text-slate-900">{numberFormat(roles.length)}</div>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Unread alerts</div>
                <div className="mt-1 text-2xl font-black text-slate-900">{numberFormat(unreadCount)}</div>
              </div>
            </div>
          </SectionPanel>
        </div>
      </div>
    </section>
  );
}
