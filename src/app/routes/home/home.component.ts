import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsService } from '../../services/teams.service';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { FixturesService } from '../../services/fixtures.service';
import { MatButtonModule } from '@angular/material/button';

export interface FootballTeam {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  logo: string;
}

export interface Fixture {
  homeTeam: string;
  awayTeam: string;
  date: Date;
  round: number;
}

export interface TeamLogo {
  team: string;
  logo: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatTableModule, MatSortModule, CommonModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['position', 'team', 'played', 'won', 'drawn', 'lost', 'gf', 'ga', 'gd', 'points'];
  dataSource = new MatTableDataSource<FootballTeam>();

  roundFixturesDataSource = new MatTableDataSource<Fixture>();
  allFixtures: Fixture[] = [];
  allTeams: TeamLogo[] = [];

  matchOffset = 0;
  matchesPerPage = 5;

  currentRound = 1;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private teamsService: TeamsService,
    private fixturesService: FixturesService,
    private _liveAnnouncer: LiveAnnouncer
  ) {}

  ngOnInit(): void {
    this.teamsService.getTeams().subscribe((teams) => {
      this.dataSource.data = teams.map((team, index) => ({
        position: index + 1,
        team: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
        logo: team.logo,
      }));

      this.allTeams = teams.map((team) => ({
        team: team.name,
        logo: team.logo,
      }));

      const teamNames = teams.map((team) => team.name);
      this.allFixtures = this.fixturesService.generateFixtures(teamNames);

      this.updateDisplayedFixtures();
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  updateDisplayedFixtures() {
    const start = this.matchOffset;
    const end = this.matchOffset + this.matchesPerPage;
    this.roundFixturesDataSource.data = this.allFixtures.slice(start, end);
    this.currentRound = Math.floor(this.matchOffset / this.matchesPerPage) + 1;
  }

  nextMatches() {
    if (this.matchOffset + this.matchesPerPage < this.allFixtures.length) {
      this.matchOffset += this.matchesPerPage;
      this.updateDisplayedFixtures();
    }
  }

  previousMatches() {
    if (this.matchOffset - this.matchesPerPage >= 0) {
      this.matchOffset -= this.matchesPerPage;
      this.updateDisplayedFixtures();
    }
  }

  getTeamLogo(teamName: string): string {
    const team = this.allTeams.find((t) => t.team === teamName);
    return team ? team.logo : '';
  }
}
