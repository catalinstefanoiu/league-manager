import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { AdminPlayerService } from '../../admin-players/admin-player.service';
import { Player } from '../../../models/player.model';
import { LoggerService } from '../../../services/logger.service';
import { MatInput } from '@angular/material/input';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-place-bid-dialog',
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatDialogModule,
    MatInput,
    MatLabel,
    //MatSlider,
    //MatSliderThumb,
    FormsModule,
    MatFormFieldModule,
    DecimalPipe
  ],
  templateUrl: './place-bid-dialog.component.html',
  styleUrl: './place-bid-dialog.component.scss'
})
export class PlaceBidDialogComponent implements OnInit {
  private playerSvc = inject(AdminPlayerService);
  private logger = inject(LoggerService);

  protected player: Player;
  protected valueBid = 0;
  protected valueMin = 0;
  protected valueMax = 0;

  constructor(
    private dialogRef: MatDialogRef<PlaceBidDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.player = data.player;
    this.logger.debug(this.player);
    this.valueBid = this.player.marketValue;
    this.valueMin = this.player.marketValue - 5000;
    this.valueMax = this.player.marketValue + 5000;
  }

  ngOnInit(): void {
    this.logger.debug('PlaceBidDialogComponent initialized with player:', this.player);
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }

  async onOkClick() {
    try {
      this.logger.debug('bid value', this.valueBid);
      await this.playerSvc.placeBid(this.player.pid, this.valueBid);
      this.dialogRef.close(true);
    } catch (ex) {
      this.logger.error(ex);
    }
  }
}
