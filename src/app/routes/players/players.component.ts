import { Component, inject, OnInit } from '@angular/core';
import { PlayersService } from '../../services/players.service';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '../../services/logger.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-players',
  imports: [],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private playersSvc = inject(PlayersService);
  private loaddingSvc = inject(LoadingService);
  private logger = inject(LoggerService);
  private teamId: string = '';

  async ngOnInit() {
    try {
      this.teamId = this.route.snapshot.paramMap.get('teamId') || '';
      this.logger.debug('Team ID:', this.teamId);
      if (this.teamId) {
        this.loaddingSvc.loadingOn();
        const players = await this.playersSvc.getTeamPlayers(this.teamId);
        this.logger.debug('Players:', players);
      }
    } catch (error) {
      this.logger.error('Error fetching players:', error);
    } finally {
      this.loaddingSvc.loadingOff();
    }
  }
}
