import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';
import { Player } from '../models/player.model';
import { Team } from '../models/team.model';


export type TeamPlayers = {
  team: Team;
  players: Player[];
}

@Injectable({
  providedIn: 'root',
})
export class PlayersService extends ApiBaseService {
  
  public async getTeamPlayers(teamId: string): Promise<TeamPlayers> {
    return this.getRequest<TeamPlayers>(`/players/${teamId}`);
  }

  public async getPlayerById(pid: string): Promise<Player> {
    return this.getRequest<Player>(`/players/info/${pid}`);
  }
}