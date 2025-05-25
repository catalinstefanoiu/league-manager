import { Component, inject, OnInit } from '@angular/core';
import { PlayersService } from '../../services/players.service';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '../../services/logger.service';
import { LoadingService } from '../../services/loading.service';
import { Player } from '../../models/player.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { Team } from '../../models/team.model';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-players',
  imports: [CommonModule, MatCardModule, RouterModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private titleSvc = inject(Title);
  private playersSvc = inject(PlayersService);
  private loaddingSvc = inject(LoadingService);
  private logger = inject(LoggerService);
  public teamId: string = '';
  protected team: Team | null = null;

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
        const data = await this.playersSvc.getTeamPlayers(this.teamId);
        this.team = data.team;
        this.titleSvc.setTitle(`Team players: ${this.team?.name}`);
        this.players = data.players || [];
        this.logger.debug('Players:', this.players);
        
        this.players.forEach((p) => {
          if (p.isCoach) {
            this.coach = p;
          }
          if (p.position === 'Portar') {
            this.goalkeepers.push(p);
          } else if (p.position === 'Fundaș stânga' || p.position === 'Fundaș dreapta' || p.position === 'Fundaș central') {
            this.defenders.push(p);
          }
          else if (p.position === 'Mijlocaș stânga' || p.position === 'Mijlocaș dreapta' || p.position === 'Mijlocaș central') {
            this.midfielders.push(p);
          }
          else if (p.position === 'Extremă stânga' || p.position === 'Extremă dreapta' || p.position === 'Atacant') {
            this.forwards.push(p);
          }
        });
      }
    } catch (error) {
      this.logger.error('Error fetching players:', error);
    } finally {
      this.loaddingSvc.loadingOff();
    }
  }
}
