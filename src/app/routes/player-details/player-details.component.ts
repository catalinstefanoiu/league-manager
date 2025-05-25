import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Player } from '../../models/player.model';
import { PlayersService } from '../../services/players.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { LoggerService } from '../../services/logger.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule],
  templateUrl: './player-details.component.html',
  styleUrls: ['./player-details.component.scss']
})
export class PlayerDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private titleSvc = inject(Title);
  private playersService = inject(PlayersService);
  private logger = inject(LoggerService)
  player?: Player;
  loading = true;

  async ngOnInit() {
    const pid = this.route.snapshot.paramMap.get('playerId');
    this.logger.debug('Player ID:', pid);
    if (pid) {
      try {
        this.player = await this.playersService.getPlayerById(pid);
        this.titleSvc.setTitle(`Player details: ${this.player.displayName}`);
        this.logger.debug('Player loaded', this.player);
      } catch (err) {
        console.error('Failed to load player', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
