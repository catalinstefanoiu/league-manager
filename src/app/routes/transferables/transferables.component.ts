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
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { PlayerService } from '../players/player.service';
import { UtilsService } from '../../services/utils.service';
import { Player, TransferRequest } from '../../models/player.model';
import { Team } from '../../models/team.model';
import { PlayersEditComponent } from '../players/players-edit/players-edit.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

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
  transferReqs?: TransferRequest[];
}

@Component({
  selector: 'app-transferables',
  imports: [
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginator,
    MatSort,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule
  ],
  templateUrl: './transferables.component.html',
  styleUrl: './transferables.component.scss'
})
export class TransferablesComponent {
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
  protected displayedColumns = ['idx', 'actions', 'displayName', 'age', 'position', 'team', 'dateStarted'];

  protected placeBidDisabled = true;
  protected cancelBidDisabled = true;

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

      this.players = await this.playerSvc.getTransferables();
      this.logger.debug(this.players);
      const displayPlayers = this.players
        // .filter((p) => p.age === 19)
        .map((player) => {
          return {
            pid: player.pid,
            firstName: player.firstName,
            lastName: player.lastName,
            displayName: `${player.displayName ?? ''}`,
            age: player.age,
            position: player.position,
            isCoach: player.isCoach,
            transferable: player.transferable,
            teamId: player.teamId ?? '',
            team: this.getTeam(player.teamId ?? ''),
            dateStarted: player.dateStarted,
            transferReqs: player.transferReqs
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

  protected async openPlayerMenu(player: IDisplayPlayer) {
    this.placeBidDisabled = !!player.transferReqs?.length;
    this.cancelBidDisabled = !player.transferReqs?.length;
  }

  protected async makeBid(player: IDisplayPlayer) {
    try {
      await this.playerSvc.placeBid(player.pid);
      await this.getPlayers(); 
    } catch (ex) {
      this.logger.error(ex);
    }
  }

  protected async cancelBid(player: IDisplayPlayer) {
    try {
      await this.playerSvc.cancelBid(player.pid);
      await this.getPlayers(); 
    } catch (ex) {
      this.logger.error(ex);
    }
  }
  
  protected async editPlayer(player: IDisplayPlayer) {
    // try {
    //   if (!this.teams) {
    //     this.teams = await this.adminSvc.getTeams();
    //   }
    //   const dialogRef = this.dialog.open(PlayersEditComponent, {
    //     minWidth: '300px',
    //     minHeight: '300px',
    //     disableClose: true,
    //     hasBackdrop: true,
    //     data: {
    //       player,
    //       teams: this.teams
    //     }
    //   });

    //   dialogRef.afterClosed().subscribe(async (result) => {
    //     if (result) {
    //       await this.getPlayers();
    //     }
    //   });
    // } catch (ex) {
    //   this.logger.error(ex);
    // }
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
