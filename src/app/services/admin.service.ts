import { Injectable } from '@angular/core';
import { UserRecord } from './firebase-entities';
import { ApiBaseService } from './api-base.service';
import { Team } from './models';
import { UserRole } from './auth.service';


@Injectable({
  providedIn: 'root',
})
export class AdminService extends ApiBaseService {
  
  public async getUsers(): Promise<UserRecord[]> {
    return this.getRequest<UserRecord[]>('/admin-users');
  }

  public async updateUser(userId: string, userRole: UserRole, teamId: string) {
    return this.putRequest(`/admin-users/${userId}`, {
      role: userRole,
      team: teamId
    });
  }

  public async getTeams(): Promise<Team[]> {
    return this.getRequest<Team[]>('/admin-teams');
  }
}