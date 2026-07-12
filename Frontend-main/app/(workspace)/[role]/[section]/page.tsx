import { redirect } from "next/navigation";
import ModulePage from "@/app/components/assetflow/ModulePage";
import RoleDashboard from "@/app/components/assetflow/dashboard/RoleDashboard";
import MongoWorkspacePage from "@/app/components/assetflow/MongoWorkspacePage";
import EmployeeWorkspacePage from "@/app/components/assetflow/EmployeeWorkspacePage";
import { canAccessSection, isAssetFlowRole, sectionHref, type AssetFlowRole, type AssetFlowSection } from "@/app/lib/assetflow-roles";

export default async function RoleSectionPage({
  params,
}: Readonly<{
  params: Promise<{ role: string; section: string }>;
}>) {
  const { role, section } = await params;
  if (!isAssetFlowRole(role)) {
    redirect("/login");
  }

  if (!canAccessSection(role, section)) {
    return (
      <ModulePage
        title="Access denied"
        subtitle={`The ${section} module is not available for ${role}.`}
        backHref={sectionHref(role as AssetFlowRole, "dashboard")}
      />
    );
  }

  const activeRole = role as AssetFlowRole;
  const activeSection = section as AssetFlowSection;

  if (activeRole === "employee" && activeSection !== "dashboard") {
    const employeeTitles: Record<AssetFlowSection, { title: string; subtitle: string }> = {
      dashboard: { title: "Dashboard", subtitle: "Personal workspace overview." },
      organization: { title: "Organization", subtitle: "Company structure and workspace hierarchy." },
      departments: { title: "Departments", subtitle: "Group-level visibility for your team." },
      employees: { title: "Employees", subtitle: "People and access within your workspace." },
      "roles-permissions": { title: "Roles & Permissions", subtitle: "Access overview for the workspace." },
      categories: { title: "Categories", subtitle: "Assets grouped by type and usage." },
      assets: { title: "Assets", subtitle: "Available and assigned assets." },
      allocation: { title: "Allocation", subtitle: "Request and handover flow." },
      transfers: { title: "Transfers", subtitle: "Asset movement updates." },
      bookings: { title: "Bookings", subtitle: "Reserve and track room usage." },
      maintenance: { title: "Maintenance", subtitle: "Raise and monitor support requests." },
      audit: { title: "Audit", subtitle: "Review actions and workspace history." },
      reports: { title: "Reports", subtitle: "Short summaries for your manager." },
      analytics: { title: "Analytics", subtitle: "Usage patterns and trends." },
      notifications: { title: "Notifications", subtitle: "Important updates and reminders." },
      settings: { title: "Settings", subtitle: "Profile and workspace preferences." },
      "department-assets": { title: "Department Assets", subtitle: "Items shared in your department." },
      approvals: { title: "Approvals", subtitle: "Requests waiting for review." },
      "my-assets": { title: "My Assets", subtitle: "Assets assigned directly to you." },
      profile: { title: "Profile", subtitle: "Your account details and preferences." },
    };

    const meta = employeeTitles[activeSection];
    return (
      <EmployeeWorkspacePage
        section={activeSection}
        backHref={sectionHref(activeRole, "dashboard")}
        title={meta.title}
        subtitle={meta.subtitle}
      />
    );
  }

  if ((activeRole === "founder" || activeRole === "admin") && ["dashboard", "organization", "departments", "employees", "roles-permissions", "notifications"].includes(activeSection)) {
    const titles: Record<AssetFlowSection, { title: string; subtitle: string }> = {
      dashboard: { title: "Organization Overview", subtitle: "Live MongoDB snapshot for founders and admins." },
      organization: { title: "Organization", subtitle: "Company structure, hierarchy, and live team records from MongoDB." },
      departments: { title: "Departments", subtitle: "Role-based department buckets pulled from live user data." },
      employees: { title: "Employees", subtitle: "Live employee roster stored in MongoDB." },
      "roles-permissions": { title: "Roles & Permissions", subtitle: "System roles and permissions from MongoDB." },
      categories: { title: "Categories", subtitle: "Electronics, furniture, vehicles, rooms, and equipment." },
      assets: { title: "Assets", subtitle: "Register and manage company assets." },
      allocation: { title: "Allocation", subtitle: "Approve, assign, and return assets." },
      transfers: { title: "Transfers", subtitle: "Move assets between people and departments." },
      bookings: { title: "Bookings", subtitle: "Reserve rooms, projectors, and vehicles." },
      maintenance: { title: "Maintenance", subtitle: "Handle maintenance requests and resolutions." },
      audit: { title: "Audit", subtitle: "Review audit cycles and discrepancies." },
      reports: { title: "Reports", subtitle: "Summaries for leadership and team reviews." },
      analytics: { title: "Analytics", subtitle: "Usage trends and operational insights." },
      notifications: { title: "Notifications", subtitle: "Updates, approvals, and reminders." },
      settings: { title: "Settings", subtitle: "Profile and workspace preferences." },
      "department-assets": { title: "Department Assets", subtitle: "Assets owned by your department." },
      approvals: { title: "Approvals", subtitle: "Pending allocation and booking approvals." },
      "my-assets": { title: "My Assets", subtitle: "Assets assigned directly to you." },
      profile: { title: "Profile", subtitle: "Your account details and preferences." },
    };

    const meta = titles[activeSection];
    return <MongoWorkspacePage role={activeRole} section={activeSection} title={meta.title} subtitle={meta.subtitle} />;
  }

  if (activeSection === "dashboard") {
    return <RoleDashboard role={activeRole} />;
  }

  const titles: Record<AssetFlowSection, { title: string; subtitle: string }> = {
    dashboard: { title: "Dashboard", subtitle: "Role-based enterprise snapshot." },
    organization: { title: "Organization", subtitle: "Manage company structure, hierarchy, and governance." },
    departments: { title: "Departments", subtitle: "Create departments and assign owners." },
    employees: { title: "Employees", subtitle: "Track people, roles, and ownership." },
    "roles-permissions": { title: "Roles & Permissions", subtitle: "Control access across the platform." },
    categories: { title: "Categories", subtitle: "Electronics, furniture, vehicles, rooms, and equipment." },
    assets: { title: "Assets", subtitle: "Register and manage company assets." },
    allocation: { title: "Allocation", subtitle: "Approve, assign, and return assets." },
    transfers: { title: "Transfers", subtitle: "Move assets between people and departments." },
    bookings: { title: "Bookings", subtitle: "Reserve rooms, projectors, and vehicles." },
    maintenance: { title: "Maintenance", subtitle: "Handle maintenance requests and resolutions." },
    audit: { title: "Audit", subtitle: "Review audit cycles and discrepancies." },
    reports: { title: "Reports", subtitle: "Summaries for leadership and team reviews." },
    analytics: { title: "Analytics", subtitle: "Usage trends and operational insights." },
    notifications: { title: "Notifications", subtitle: "Updates, approvals, and reminders." },
    settings: { title: "Settings", subtitle: "Profile and workspace preferences." },
    "department-assets": { title: "Department Assets", subtitle: "Assets owned by your department." },
    approvals: { title: "Approvals", subtitle: "Pending allocation and booking approvals." },
    "my-assets": { title: "My Assets", subtitle: "Assets assigned directly to you." },
    profile: { title: "Profile", subtitle: "Your account details and preferences." },
  };

  const meta = titles[activeSection];
  return <ModulePage title={meta.title} subtitle={meta.subtitle} backHref={sectionHref(activeRole, "dashboard")} />;
}
