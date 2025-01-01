import { Component, Inject, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Team } from '../../../models/team.model';
import { getPlayerPositions, Player } from '../../../models/player.model';
import { AuthService, UserRole } from '../../../services/auth.service';
import { PlayerService } from '../player.service';
import { LoggerService } from '../../../services/logger.service';

@Component({
  selector: 'app-player-edit',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './players-edit.component.html',
  styleUrl: './players-edit.component.scss'
})
export class PlayersEditComponent {
  protected UserRole = UserRole;
  private playerSvc = inject(PlayerService);
  private logger = inject(LoggerService);
  protected authSvc = inject(AuthService);
  protected user = this.authSvc.currentUser;

  protected formPlayer = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    age: new FormControl(0, Validators.required),
    position: new FormControl('', Validators.required),
    team: new FormControl<string | null>('')
  });

  protected positions = getPlayerPositions();
  protected teams: Team[];
  protected player: Player;

  constructor(
    private dialogRef: MatDialogRef<PlayersEditComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.player = data.player;
    this.teams = data.teams;
  }

  ngOnInit(): void {
    this.formPlayer.patchValue({
      firstName: this.player.firstName,
      lastName: this.player.lastName,
      age: this.player.age,
      position: this.player.position,
      team: this.player.teamId,
      // dateStarted: this.player.dateStarted
    });
  }

  async onOkClick() {
    if (this.formPlayer.invalid) {
      return;
    }

    try {
      const player: Player = {
        firstName: this.formPlayer.value.firstName!,
        lastName: this.formPlayer.value.lastName!,
        displayName: `${this.formPlayer.value.firstName!} ${this.formPlayer.value.lastName}`,
        age: this.formPlayer.value.age!,
        position: this.formPlayer.value.position!,
        teamId: this.formPlayer.value.team!,
        dateStarted: this.player.dateStarted,
        isCoach: false,
        pid: this.player.pid
      };
      
      await this.playerSvc.updatePlayer(player);
      this.dialogRef.close(true);
    } catch (ex) {
      this.logger.error(ex);
    }
  }
}
