import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButton } from '@angular/material/button';
import { Team } from '../../models/team.model';
import { AdminService } from '../../services/admin.service';
import { LoggerService } from '../../services/logger.service';
import { LoadingService } from '../../services/loading.service';
import { RouterLink, RouterLinkActive } from '@angular/router';


type DisplayedTeam = Team & {
  position: number;
  gd: number;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['position', 'name', 'played', 'won', 'drawn', 'lost', 'gf', 'ga', 'gd', 'points'];
  dataSource = new MatTableDataSource<DisplayedTeam>();

  @ViewChild(MatSort) sort!: MatSort;

  protected teams: Team[] = [];

  constructor(
    private adminSvc: AdminService,
    private logger: LoggerService,
    private loadingSvc: LoadingService,
    private _liveAnnouncer: LiveAnnouncer
  ) { }

  async ngOnInit() {
    try {
      this.loadingSvc.loadingOn();
      const teams = await this.adminSvc.getStandings();
      teams.sort((a, b) => {
        const gda = +a.gf - +a.ga;
        const gdb = +b.gf - +b.ga;
        if (+b.points !== +a.points) {
          return +b.points - +a.points;
        } else if (gdb !== gda) {
          return gdb - gda;
        } else {
          return +b.gf - +a.gf;
        }
      });

      this.dataSource.data = teams.map((team, index) => ({
        position: index + 1,
        tid: team.tid,
        name: team.name,
        logo: team.logo,
        played: team.played ?? 0,
        won: team.won ?? 0,
        drawn: team.drawn ?? 0,
        lost: team.lost ?? 0,
        gf: team.gf ?? 0,
        ga: team.ga ?? 0,
        gd: (team.gf ?? 0) - (team.ga ?? 0),
        points: team.points ?? 0,
        coachId: team.coachId,
        managerId: team.managerId
      }));

      this.teams = teams;
    } catch (error) {
      this.logger.error(error);
    } finally {
      this.loadingSvc.loadingOff();
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  onSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
