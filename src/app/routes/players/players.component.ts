import { Component, inject, OnInit } from '@angular/core';
import { PlayersService } from '../../services/players.service';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '../../services/logger.service';
import { LoadingService } from '../../services/loading.service';
import { Player } from '../../models/player.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-players',
  imports: [CommonModule, MatCardModule, RouterModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private playersSvc = inject(PlayersService);
  private loaddingSvc = inject(LoadingService);
  private logger = inject(LoggerService);
  public teamId: string = '';

  public players: Player[] = [];
  goalkeepers: Player[] = [];
  defenders: Player[] = []
  midfielders: Player[] = [];
  forwards: Player[] = [];
  coach: Player | null = null;
  

  async ngOnInit() {
    try {
      this.teamId = this.route.snapshot.paramMap.get('teamId') || '';
      this.logger.debug('Team ID:', this.teamId);
      if (this.teamId) {
        this.loaddingSvc.loadingOn();
        const players = await this.playersSvc.getTeamPlayers(this.teamId);
        this.logger.debug('Players:', players);
        this.players = players;

        this.coach = players.find(p => p.isCoach) || null;
        this.goalkeepers = players.filter(p => p.position === 'Portar');
        this.defenders = players.filter(p => p.position === 'Fundaș stânga' || p.position === 'Fundaș dreapta' || p.position === 'Fundaș central');
        this.midfielders = players.filter(p => p.position === 'Mijlocaș stânga' || p.position === 'Mijlocaș dreapta' || p.position === 'Mijlocaș central');
        this.forwards = players.filter(p => p.position === 'Extremă stânga' || p.position === 'Extremă dreapta' || p.position === 'Atacant');
      }
    } catch (error) {
      this.logger.error('Error fetching players:', error);
    } finally {
      this.loaddingSvc.loadingOff();
    }
  }
}
