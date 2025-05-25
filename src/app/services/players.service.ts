import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';
import { Player } from '../models/player.model';


@Injectable({
  providedIn: 'root',
})
export class PlayersService extends ApiBaseService {
  
  public async getTeamPlayers(teamId: string): Promise<Player[]> {
    return this.getRequest<Player[]>(`/players/${teamId}`);
  }

  public async getPlayerById(pid: string): Promise<Player> {
    return this.getRequest<Player>(`/players/info/${pid}`);
  }
}