import { hasPermission, PermissionData } from "permissio";

export enum AdminPermissions {
    ADMIN,
    ADD_PARKING_SPOT,
    REMOVE_PARKING_SPOT,
}
export type AdminPermissionKeys = keyof typeof AdminPermissions;

export const AdminPermissionNames = ((values = Object.keys(AdminPermissions)) =>
    values.slice(values.length / 2))() as AdminPermissionKeys[];

export const hasAdminPermission = (data: PermissionData, permission: AdminPermissions) => {
    return hasPermission(data, AdminPermissions.ADMIN) || hasPermission(data, permission);
};
