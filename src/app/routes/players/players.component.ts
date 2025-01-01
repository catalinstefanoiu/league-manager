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

interface IDisplayPlayer {
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
  protected pageSizeOptions = [50, 100];
  protected pageSize = this.pageSizeOptions[0];
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
    this.players = await this.playerSvc.getPlayers(this.authSvc.userTeam);
    this.logger.debug(this.players);
  }

  protected async editPlayer(player: IDisplayPlayer) {

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
