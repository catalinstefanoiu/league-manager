import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';
import { Team } from '../../models/team.model';
import { AddPlayerComponent } from './add-player/add-player.component';

@Component({
  selector: 'app-admin-teams',
  imports: [],
  templateUrl: './admin-teams.component.html',
  styleUrl: './admin-teams.component.scss'
})
export class AdminTeamsComponent {

  private adminSvc = inject(AdminService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);

  teams: Team[] = [];

  async ngOnInit() {
    this.teams = await this.adminSvc.getTeamsSlims();
  }

  openAddPlayerDialog(team: Team) {
    const dialogRef = this.dialog.open(AddPlayerComponent,{
      minWidth: '400px',
      disableClose: true,
      data: { team }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.snackbar.open('Player added successfully', 'Close', { duration: 3000 });
        this.teams = await this.adminSvc.getTeamsSlims(); // Refresh teams
      } else {
        this.snackbar.open('Failed to add player', 'Close', { duration: 3000 });
      }
    });
  }
  
}
