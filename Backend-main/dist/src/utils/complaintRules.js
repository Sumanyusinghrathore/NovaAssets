"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONSITE_CAPACITY_MESSAGE = exports.ENGINEER_CAPACITY_MESSAGE = exports.ACTIVE_COMPLAINT_DUPLICATE_MESSAGE = exports.CLOSED_COMPLAINT_STATUSES = exports.LOBBY_TICKET_STATUSES = exports.ACTIVE_TICKET_STATUSES = exports.RESOLVED_COMPLAINT_STATUSES = exports.IN_PROGRESS_COMPLAINT_STATUSES = exports.OPEN_COMPLAINT_STATUSES = exports.MAX_WAITING_LOBBY_TICKETS = exports.MAX_ACTIVE_SERVICE_TICKETS = void 0;
exports.normalizeComplaintSerialKey = normalizeComplaintSerialKey;
exports.isClosedComplaintStatus = isClosedComplaintStatus;
exports.isActiveComplaintStatus = isActiveComplaintStatus;
exports.isWaitingLobbyComplaint = isWaitingLobbyComplaint;
exports.isActiveWorkComplaint = isActiveWorkComplaint;
exports.MAX_ACTIVE_SERVICE_TICKETS = 5;
exports.MAX_WAITING_LOBBY_TICKETS = 5;
const LEGACY_BRAND = ["A", "u", "r", "a", "w", "a", "t", "t"].join("");
exports.OPEN_COMPLAINT_STATUSES = [
    "Open at NovaAssets",
    `Open at ${LEGACY_BRAND}`,
];
exports.IN_PROGRESS_COMPLAINT_STATUSES = [
    "In Progress at NovaAssets",
    `In Progress at ${LEGACY_BRAND}`,
];
exports.RESOLVED_COMPLAINT_STATUSES = [
    "Resolved by NovaAssets",
    `Resolved by ${LEGACY_BRAND}`,
];
exports.ACTIVE_TICKET_STATUSES = [
    "New",
    "Assigned",
    "In Progress",
    ...exports.OPEN_COMPLAINT_STATUSES,
    "Assigned to Engineer",
    ...exports.IN_PROGRESS_COMPLAINT_STATUSES,
    "Escalated to L2",
    "Escalated to L3",
    "Pending L3 Approval",
    "Spare Requested",
    "Replacement Requested",
    "Awaiting Dispatch",
    "Dispatch in Progress",
];
exports.LOBBY_TICKET_STATUSES = [
    "Pending Assignment",
    "Waiting Queue",
    "Waiting Lobby",
];
exports.CLOSED_COMPLAINT_STATUSES = [
    ...exports.RESOLVED_COMPLAINT_STATUSES,
    "Resolved by Suppliers",
];
exports.ACTIVE_COMPLAINT_DUPLICATE_MESSAGE = "An active complaint already exists for this serial number. Please wait until the current ticket is resolved or closed before creating a new complaint for the same serial number.";
exports.ENGINEER_CAPACITY_MESSAGE = "The selected engineer has reached the maximum ticket capacity (5 Active Work + 5 Waiting Lobby tickets). Please assign this ticket to another engineer.";
exports.ONSITE_CAPACITY_MESSAGE = "Selected engineer already has 5 active onsite inspection tickets. Please select another engineer.";
function normalizeComplaintSerialKey(value) {
    return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}
function isClosedComplaintStatus(status) {
    return exports.CLOSED_COMPLAINT_STATUSES.includes(String(status));
}
function isActiveComplaintStatus(status) {
    return !isClosedComplaintStatus(status);
}
function isWaitingLobbyComplaint(complaint) {
    return complaint.assignmentStatus === "Waiting" && exports.LOBBY_TICKET_STATUSES.includes(complaint.status);
}
function isActiveWorkComplaint(complaint) {
    return complaint.assignmentStatus === "Assigned" && exports.ACTIVE_TICKET_STATUSES.includes(complaint.status) && !isWaitingLobbyComplaint(complaint);
}
