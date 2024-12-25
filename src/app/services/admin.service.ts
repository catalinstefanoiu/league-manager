import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { UserRecord } from './firebase-entities';
import { ApiBaseService } from './base-api.service';


@Injectable({
  providedIn: 'root',
})
export class AdminService extends ApiBaseService {
  
  public async getUsers(): Promise<UserRecord[]> {
    return this.getRequest<UserRecord[]>('/admin-users');
  }
}