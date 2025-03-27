import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc as baseAdminAc } from "better-auth/plugins/admin/access";

export const accessControl = createAccessControl({
  ...defaultStatements,
  election: ["create", "open", "close", "compute", "track"] as const,
});

const superAdminAc = accessControl.newRole({
  ...baseAdminAc.statements,
  election: ["create", "open", "close", "compute", "track"],
});

const adminAc = accessControl.newRole({
  user: ["create"],
  election: ["create", "open", "close", "compute", "track"],
});

const observerAc = accessControl.newRole({
  election: ["track"],
});

export const adminRoles = ["superAdmin", "admin"];

export const roles = {
  superadmin: superAdminAc,
  admin: adminAc,
  observer: observerAc,
};
