import { Injectable } from '@angular/core';
import { UserRecord } from './firebase-entities';
import { ApiBaseService } from './api-base.service';
import { Team } from '../models/team.model';
import { UserRole } from './auth.service';
import { FixtureMatch } from './fixture.service';


export type DBFixtureMatch = {
  homeTeam: {
    id: string;
    gf: number;
  };
  awayTeam: {
    id: string;
    gf: number;
  };
  date: Date;
  round: number;
};

export type UIFixtureMatch = {
  fid: string;
  homeTeam: {
    id: string;
    name: string;
    logo: string;
    gf: number;
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string;
    gf: number;
  };
  date: Date;
  round: number;
};

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

  public async getStandings(): Promise<Team[]> {
    return this.getRequest<Team[]>('/championship/standings');
  }

  public async getTeams(): Promise<Team[]> {
    return this.getRequest<Team[]>('/admin-teams');
  }

  public async getTeamsSlims(): Promise<Team[]> {
    return this.getRequest<Team[]>('/admin-teams/slim');
  }

  public saveFixtureToDB(fixtures: DBFixtureMatch[]): Promise<void> {
    return this.postRequest<any>('/championship/fixtures', { fixtures });
  }

  public async getFixtures(round: number = 0): Promise<UIFixtureMatch[]> {
    return this.getRequest<UIFixtureMatch[]>(`/championship/fixtures?round=${round}`);
  }

  public async updateFixtureScore(fixtureId: string, home: number, away: number): Promise<void> {
    return this.patchRequest<any>(`/championship/fixtures/${fixtureId}/score`, { home, away });
  }
}