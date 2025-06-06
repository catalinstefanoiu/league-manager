import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { AdminService, UIFixtureMatch } from '../../services/admin.service';
import { LoggerService } from '../../services/logger.service';
import { LoadingService } from '../../services/loading.service';
import { HeadToHeadComponent } from './head-to-head/head-to-head.component';
import { min } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

type ChampionshipRound = {
  round: number;
  date: Date;
  fixtures: UIFixtureMatch[];
};

@Component({
  selector: 'app-fixtures',
  imports: [
    DatePipe,
    MatButton,
    MatMiniFabButton,
    MatIcon,
    ReactiveFormsModule
  ],
  templateUrl: './fixtures.component.html',
  styleUrl: './fixtures.component.scss'
})
export class FixturesComponent implements OnInit {
  private logger: LoggerService = inject(LoggerService);
  private loadingSvc: LoadingService = inject(LoadingService);
  private adminSvc: AdminService = inject(AdminService);
  private dialog = inject(MatDialog)

  protected round: ChampionshipRound | null = null;
  protected nextDisabled = false;
  private maxRound = 0;

  async ngOnInit(): Promise<void> {
    try {
      this.loadingSvc.loadingOn();
      const fixtures = await this.adminSvc.getCurrentRound();
      this.logger.log('Fixtures from DB:', fixtures);

      if (fixtures.length) {
        this.round = {
          round: fixtures[0].round,
          date: fixtures[0].date,
          fixtures
        };
      }
    } catch (error) {
      this.logger.error('Error generating fixtures:', error);
    } finally {
      this.loadingSvc.loadingOff();
    }
  }

  public async onPreviousRoundClick() {
    try {
      if (this.round?.round === 1) {
        return;
      }

      this.loadingSvc.loadingOn();
      const fixtures = await this.adminSvc.getFixtures(this.round!.round - 1);
      this.logger.log('Fixtures from DB:', fixtures);

      if (fixtures.length) {
        this.round = {
          round: fixtures[0].round,
          date: fixtures[0].date,
          fixtures
        };
      }
      this.nextDisabled = false;
    } catch (error) {
      this.logger.error('Error generating fixtures:', error);
    } finally {
      this.loadingSvc.loadingOff();
    }
  }

  public async onNextRoundClick() {
    try {
      this.loadingSvc.loadingOn();
      const fixtures = await this.adminSvc.getFixtures(this.round!.round + 1);
      this.logger.log('Fixtures from DB:', fixtures);

      if (fixtures.length) {
        this.round = {
          round: fixtures[0].round,
          date: fixtures[0].date,
          fixtures
        };

        if (this.round.round === this.maxRound) {
          this.nextDisabled = true;
        }
      } else {
        this.maxRound = this.round!.round;
        this.nextDisabled = true;
      }
    } catch (error) {
      this.logger.error('Error generating fixtures:', error);
    } finally {
      this.loadingSvc.loadingOff();
    }
  }

  public onViewClick(fixture: UIFixtureMatch) {
    this.dialog.open(HeadToHeadComponent, {
      minWidth: '500px',
      data: {
        homeTeamId: fixture.homeTeam.id,
        awayTeamId: fixture.awayTeam.id
      },
      autoFocus: false
    })
  }
}
