import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { LoggerService } from '../../services/logger.service';
import { AdminService } from '../../services/admin.service';
import { UtilsService } from '../../services/utils.service';
import { Team } from '../../models/team.model';
import { PlayerService } from './player.service';
import { Player } from '../../models/player.model';
import { AuthService } from '../../services/auth.service';
import { PlayersEditComponent } from './players-edit/players-edit.component';

interface IDisplayPlayer {
  pid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  age: number;
  position: string;
  teamId: string;
  team: string;
  dateStarted: Date;
}

@Component({
  selector: 'app-players',
  imports: [
    DatePipe,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginator,
    MatSort,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule
  ],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  private dialog = inject(MatDialog);
  private logger = inject(LoggerService);
  private authSvc = inject(AuthService);
  private adminSvc = inject(AdminService);
  private playerSvc = inject(PlayerService);
  protected utilsSvc = inject(UtilsService);

  private players: Player[] = [];
  protected dataSource: MatTableDataSource<IDisplayPlayer> = new MatTableDataSource<IDisplayPlayer>([]);
  protected pageSizeOptions = [50, 100, 250];
  protected pageSize = this.pageSizeOptions[2];
  protected pageIndex = 0;
  protected displayedColumns = ['idx', 'displayName', 'age', 'position', 'team', 'dateStarted'];

  private teams: Team[] | undefined;

  async ngOnInit(): Promise<void> {
    await this.getPlayers();
  }

  /**
  * Set the paginator and sort after the view init since this component will
  * be able to query its view for the initialized paginator and sort.
  */
  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator!;
      this.dataSource.sort = this.sort!;
    }
  }

  private async getPlayers() {
    try {
      this.teams = await this.adminSvc.getTeams();
      this.teams.unshift({
        tid: '',
        name: '<no team>',
        logo: '',
        coachId: '',
        managerId: '',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        points: 0
      });

      this.players = await this.playerSvc.getPlayers(this.authSvc.userTeam);
      this.logger.debug(this.players);
      const displayPlayers = this.players
        // .filter((p) => p.age === 19)
        .map((player) => {
          return {
            pid: player.pid,
            firstName: player.firstName,
            lastName: player.lastName,
            displayName: `${player.displayName ?? ''}${player.isCoach ? ' (C)' : ''}${player.transferable ? ' (T)' : ''}`,
            age: player.age,
            position: player.position,
            isCoach: player.isCoach,
            transferable: player.transferable,
            teamId: player.teamId ?? '',
            team: this.getTeam(player.teamId ?? ''),
            dateStarted: player.dateStarted
          } as IDisplayPlayer;
        })
        .sort((a, b) =>
          a.team.localeCompare(b.team) ||
          a.position.localeCompare(b.position) ||
          a.lastName.localeCompare(b.lastName) ||
          a.lastName.localeCompare(b.firstName));
      this.dataSource = new MatTableDataSource(displayPlayers);
      this.dataSource.filterPredicate = this.filterPredicate;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    } catch (ex) {
      this.logger.error(ex);
    }
  }

  private async allocatePlayers() {
    if (!this.players || !this.teams) {
      return;
    }

    const teams = this.teams
      .filter((team) => team.tid)
      .map((team) => {
        return {
          teamId: team.tid,
          positionMap: new Map<string, number>()
        }
      });

    const allocateTeam = (position: string): string => {
      for (let i = 0; i < teams.length; i++) {
        const count = teams[i].positionMap.get(position) ?? 0;
        if (count < 2) {
          teams[i].positionMap.set(position, count + 1);
          return teams[i].teamId;
        }
      }

      const random = Math.floor(Math.random() * teams.length);
      const count = teams[random].positionMap.get(position) ?? 0;
      teams[random].positionMap.set(position, count + 1);
      return teams[random].teamId;
    };

    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].teamId) {
        continue;
      }
      const teamId = allocateTeam(this.players[i].position);
      this.logger.debug(teamId);
      this.players[i].teamId = teamId;
    }
    this.logger.debug(teams);

    // try {
    //   this.playerSvc.allocatePlayers(this.players);
    // } catch (ex) {
    //   this.logger.error(ex);
    // }

    const displayPlayers = this.players
      // .filter((p) => p.age === 19)
      .map((player) => {
        return {
          pid: player.pid,
          firstName: player.firstName,
          lastName: player.lastName,
          displayName: player.displayName ?? '',
          age: player.age,
          position: player.position,
          teamId: player.teamId ?? '',
          team: this.getTeam(player.teamId ?? ''),
          dateStarted: new Date(player.dateStarted)
        } as IDisplayPlayer;
      })
      .sort((a, b) => a.position.localeCompare(b.position));
    this.dataSource = new MatTableDataSource(displayPlayers);
    this.dataSource.filterPredicate = this.filterPredicate;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  protected async editPlayer(player: IDisplayPlayer) {
    try {
      if (!this.teams) {
        this.teams = await this.adminSvc.getTeams();
      }
      const dialogRef = this.dialog.open(PlayersEditComponent, {
        minWidth: '300px',
        minHeight: '300px',
        disableClose: true,
        hasBackdrop: true,
        data: {
          player,
          teams: this.teams
        }
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.getPlayers();
        }
      });
    } catch (ex) {
      this.logger.error(ex);
    }
  }

  tablePageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getRowIndex(rowIdx: number): number {
    return this.pageIndex * this.pageSize + rowIdx + 1;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private filterPredicate = (data: IDisplayPlayer, filterValue: string): boolean => {
    let started = '';
    if (data.dateStarted) {
      started = this.utilsSvc.formatDateTimeLocale(data.dateStarted);
    }
    const dataValue = data.displayName + data.team + data.position + started;
    return dataValue.toLowerCase().includes(filterValue);
  }

  private getTeam(teamId: string): string {
    const team = this.teams?.find((t) => t.tid === teamId);
    return team?.name ?? '';
  }
}
