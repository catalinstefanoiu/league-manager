import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { getPlayerPositions, Player } from '../../../models/player.model';
import { Team } from '../../../models/team.model';
import { AdminPlayerService } from '../../admin-players/admin-player.service';
import { LoggerService } from '../../../services/logger.service';
import { Firestore } from '@angular/fire/firestore';
import { doc, collection, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-add-player',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './add-player.component.html',
  styleUrl: './add-player.component.scss'
})
export class AddPlayerComponent implements OnInit {
  private firestore = inject(Firestore);
  private playerSvc = inject(AdminPlayerService);
  private logger = inject(LoggerService);

  formPlayer = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    age: new FormControl(18, [Validators.required, Validators.min(10), Validators.max(50)]),
    position: new FormControl('', Validators.required),
    isCoach: new FormControl(false),
    marketValue: new FormControl(50000, [Validators.required, Validators.min(1000)])
  });

  positions = getPlayerPositions();
  team: Team;

  constructor(
    private dialogRef: MatDialogRef<AddPlayerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { team: Team }
  ) {
    this.team = data.team;
  }

  ngOnInit(): void {}

  async onOkClick() {
    if (this.formPlayer.invalid) return;

    try {
      const form = this.formPlayer.value;
      const playerId = doc(collection(this.firestore, 'players')).id;
      const player: Player = {
        pid: playerId,
        firstName: form.firstName!,
        lastName: form.lastName!,
        displayName: `${form.firstName} ${form.lastName}`,
        age: form.age!,
        position: form.position!,
        teamId: this.team.tid,
        isCoach: form.isCoach!,
        marketValue: form.marketValue!,
        dateStarted: new Date(),
        transferable: false,
        transferReqs: []
      };

      await this.playerSvc.updatePlayer(player);
      this.dialogRef.close(true);
    } catch (ex) {
      this.logger.error(ex);
    }
  }

  onCancelClick() {
    this.dialogRef.close(false);
  }
}
