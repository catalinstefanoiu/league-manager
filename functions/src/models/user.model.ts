export enum UserRole {
  User = 0,
  TeamManager,
  TeamAdmin,
  AppAdmin
}

export type CustomClaims = {
  role: UserRole;
  team: string;
};
