import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { LoggerService } from '../../services/logger.service';
import { FixtureService } from '../../services/fixture.service';
import { DatePipe } from '@angular/common';
import { AdminService, UIFixtureMatch } from '../../services/admin.service';
import { MatDialog } from '@angular/material/dialog';
import { AddScoreDialogComponent } from './add-score/add-score-dialog.component';
import { LoadingService } from '../../services/loading.service';


type ChampionshipRound = {
  round: number;
  date: Date;
  fixtures: UIFixtureMatch[];
};

@Component({
  selector: 'app-championship',
  imports: [
    DatePipe,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatSuffix,
    ReactiveFormsModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
  ],
  templateUrl: './championship.component.html',
  styleUrl: './championship.component.scss'
})
export class ChampionshipComponent implements OnInit {
  readonly dialog = inject(MatDialog)
  private logger: LoggerService = inject(LoggerService);
  private adminSvc: AdminService = inject(AdminService);
  private fixtureSvc: FixtureService = inject(FixtureService);
  private loadingSvc: LoadingService = inject(LoadingService);
  readonly date = new FormControl(new Date(2024, 7, 24));

  protected fixtures: UIFixtureMatch[] = [];
  protected rounds: ChampionshipRound[] = [];

  async ngOnInit(): Promise<void> {
    try {
      this.loadingSvc.loadingOn();
      this.fixtures = await this.adminSvc.getFixtures();
      this.logger.log('Fixtures from DB:', this.fixtures);

      let round: ChampionshipRound | undefined;
      this.fixtures.forEach((fixture) => {
        if (!round || round.round !== fixture.round) {
          round = {
            round: fixture.round,
            date: fixture.date,
            fixtures: []
          };
          this.rounds.push(round);
        }
        round.fixtures.push(fixture);
      });
    } catch (error) {
      this.logger.error('Error generating fixtures:', error);
    } finally {
      this.loadingSvc.loadingOff();
    }
  }

  async onChampionshipStart() {
    if (this.date.invalid) {
      this.logger.error('Invalid date selected');
      return;
    }

    try {
      this.loadingSvc.loadingOn();
      const startDate = this.date.value || new Date();
      this.logger.log('Championship started on:', startDate);
      const teams = await this.adminSvc.getTeamsSlims();
      const fixtures = this.fixtureSvc.generateFixtures(teams, startDate);
      this.logger.log('Generated fixtures:', fixtures);

      await this.adminSvc.saveFixtureToDB(fixtures.map((fixture) => ({
        homeTeam: {
          id: fixture.homeTeam.tid,
          gf: 0
        },
        awayTeam: {
          id: fixture.awayTeam.tid,
          gf: 0
        },
        date: fixture.date,
        round: fixture.round
      })));

      this.fixtures = await this.adminSvc.getFixtures();
      this.logger.log('Fixtures from DB:', this.fixtures);

      let round: ChampionshipRound | undefined;
      this.rounds.splice(0, this.rounds.length);
      this.fixtures.forEach((fixture) => {
        if (!round || round.round !== fixture.round) {
          round = {
            round: fixture.round,
            date: fixture.date,
            fixtures: []
          };
          this.rounds.push(round);
        }
        round.fixtures.push(fixture);
      });
    } catch (error) {
      this.logger.error('Error generating fixtures:', error);
    } finally {
      this.loadingSvc.loadingOff();
    }
  }

  onFixtureScoreClick(fixture: UIFixtureMatch) {
    this.logger.log('Fixture score clicked:', fixture);
    const dialogRef = this.dialog.open(AddScoreDialogComponent, {
      data: {
        home: {
          name: fixture.homeTeam.name,
          logo: fixture.homeTeam.logo,
          gf: fixture.homeTeam.gf
        },
        away: {
          name: fixture.awayTeam.name,
          logo: fixture.awayTeam.logo,
          gf: fixture.awayTeam.gf
        }
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.logger.debug('The dialog was closed', result);
      if (result !== undefined) {
        this.adminSvc.updateFixtureScore(fixture.fid, result.home.gf, result.away.gf)
          .then(() => {
            fixture.homeTeam.gf = result.home.gf;
            fixture.awayTeam.gf = result.away.gf;
          })
          .catch((error) => this.logger.error(error));
      }
    });
  }
}
