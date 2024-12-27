import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserRole } from '../../../services/auth.service';
import { Team } from '../../../models/team.model';
import { IDisplayUser } from '../admin-users.component';
import { LoggerService } from '../../../services/logger.service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-users-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './admin-users-edit.component.html',
  styleUrl: './admin-users-edit.component.scss'
})
export class AdminUsersEditComponent implements OnInit {
  protected formUser = new FormGroup({
    displayName: new FormControl(''),
    userRole: new FormControl<UserRole | null>(UserRole.User, Validators.required),
    team: new FormControl<string | null>('', Validators.required)
  });

  protected userRoles = [{
    id: UserRole.User,
    name: 'User'
  }, {
    id: UserRole.TeamAdmin,
    name: 'Team Admin'
  }, {
    id: UserRole.TeamManager,
    name: 'Team Manager'
  }, {
    id: UserRole.AppAdmin,
    name: 'Application Admin'
  }];

  protected teams: Team[];
  private user: IDisplayUser;

  constructor(
    private dialogRef: MatDialogRef<AdminUsersEditComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private adminSvc: AdminService,
    private logger: LoggerService
  ) {
    this.user = data.user;
    this.teams = data.teams;
  }

  ngOnInit(): void {
    this.formUser.patchValue({
      displayName: this.user.displayName,
      userRole: this.user.role,
      team: this.user.teamId
    });
  }

  async onOkClick() {
    if (!this.formUser.invalid && this.formUser.value.team) {
      try {
        const userRole = this.formUser.value.userRole ?? UserRole.User;
        const teamId = this.formUser.value.team;
        await this.adminSvc.updateUser(this.user.uid, userRole, teamId);
        this.dialogRef.close(true);
      } catch (ex) {
        this.logger.error(ex);
      }
    }
  }
}
