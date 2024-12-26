import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { UserRecord } from './firebase-entities';
import { ApiBaseService } from './api-base.service';
import { Team } from './models';


@Injectable({
  providedIn: 'root',
})
export class AdminService extends ApiBaseService {
  
  public async getUsers(): Promise<UserRecord[]> {
    return this.getRequest<UserRecord[]>('/admin-users');
  }

  public async getTeams(): Promise<Team[]> {
    return this.getRequest<Team[]>('/admin-teams');
  }
}