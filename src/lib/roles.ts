export const ROLE_ADMIN = "ADMINISTRADOR";
export const ROLE_GERENTE = "GERENTE";
export const ROLE_OPERADOR = "OPERADOR";

export const CAN_MANAGE_INVENTORY = [ROLE_ADMIN, ROLE_GERENTE];
export const CAN_MANAGE_USERS = [ROLE_ADMIN];

export function hasRole(req: any, allowed: string[]): boolean {
  const role = (req?.user?.role || "").toUpperCase();
  return allowed.includes(role);
}