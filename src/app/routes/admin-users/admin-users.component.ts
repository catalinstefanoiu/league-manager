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
import { UserRole } from '../../services/auth.service';
import { UserRecord } from '../../services/firebase-entities';
import { UtilsService } from '../../services/utils.service';
import { AdminUsersEditComponent } from './admin-users-edit/admin-users-edit.component';
import { Team } from '../../services/models';


interface IDisplayUser {
  idx: number;
  uid: string;
  displayName: string;
  email: string;
  disabled: boolean;
  role: UserRole;
  displayRole: string;
  created: Date;
  lastSignIn: Date;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
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
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  private dialog = inject(MatDialog);
  private logger = inject(LoggerService);
  private adminSvc = inject(AdminService);
  protected utilsSvc = inject(UtilsService);

  private users: UserRecord[] = [];
  protected displayUsers: IDisplayUser[] = [];
  protected dataSource: MatTableDataSource<IDisplayUser> = new MatTableDataSource<IDisplayUser>([]);
  protected pageSizeOptions = [50, 100];
  protected pageSize = this.pageSizeOptions[0];
  protected pageIndex = 0;
  protected displayedColumns = ['idx', 'displayName', 'email', 'displayRole', 'created', 'lastSignIn'];

  private teams: Team[] | undefined;

  async ngOnInit(): Promise<void> {
    await this.getUsers();
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

  async getUsers() {
    try {
      this.users = await this.adminSvc.getUsers();
      this.logger.debug(this.users);
      this.displayUsers = this.users.map((user) => {
        return {
          uid: user.uid,
          displayName: user.displayName ?? '',
          email: user.email ?? '',
          disabled: user.disabled,
          role: user.customClaims?.['role'] ?? UserRole.User,
          displayRole: this.getRoleName(user.customClaims?.['role'] ?? UserRole.User),
          created: new Date(user.metadata.creationTime),
          lastSignIn: new Date(user.metadata.lastSignInTime)
        } as IDisplayUser;
      });

      this.dataSource = new MatTableDataSource(this.displayUsers);
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

  async editUser(user: IDisplayUser) {
    try {
      if (!this.teams) {
        this.teams = await this.adminSvc.getTeams();
        this.logger.debug(this.teams);
      }
      const dialogRef = this.dialog.open(AdminUsersEditComponent, {
        minWidth: '300px',
        minHeight: '300px',
        disableClose: true,
        hasBackdrop: true,
        data: {
          userId: user.uid,
          teams: this.teams
        }
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.getUsers();
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

  private filterPredicate = (data: IDisplayUser, filterValue: string): boolean => {
    let created = '', updated = '';
    if (data.created) {
      created = this.utilsSvc.formatDateTimeLocale(data.created);
    }
    if (data.lastSignIn) {
      updated = this.utilsSvc.formatDateTimeLocale(data.lastSignIn);
    }
    const dataValue = data.displayName + data.email + data.displayRole
      + created + updated;
    return dataValue.toLowerCase().includes(filterValue);
  }

  private getRoleName(role: UserRole): string {
    switch (role) {
      case UserRole.User: return 'User';
      case UserRole.TeamManager: return 'Team Manager';
      case UserRole.TeamAdmin: return 'Team Admin';
      case UserRole.AppAdmin: return 'App Admin';
    }
  }
}
