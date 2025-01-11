export enum UserRole {
  User = 0,
  TeamManager,
  TeamAdmin,
  AppAdmin
}

export interface ICustomClaims {
  role: UserRole;
  team: string;
}
