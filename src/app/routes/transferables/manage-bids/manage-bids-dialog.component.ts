import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { TransferRequest } from '../../../models/player.model';
import { AdminPlayerService } from '../../admin-players/admin-player.service';
import { LoggerService } from '../../../services/logger.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Team } from '../../../models/team.model';

interface DisplayBid extends TransferRequest {
  teamName: string;
}

@Component({
  selector: 'app-manage-bids-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './manage-bids-dialog.component.html',
  styleUrls: ['./manage-bids-dialog.component.scss']
})
export class ManageBidsDialogComponent {
  private playerSvc = inject(AdminPlayerService);
  private logger = inject(LoggerService);
  private snackBar = inject(MatSnackBar);

  protected displayedColumns: string[] = ['team', 'value', 'date', 'actions'];
  protected dataSource: DisplayBid[] = [];
  protected processing = false;

  constructor(
    public dialogRef: MatDialogRef<ManageBidsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      player: any,
      transferReqs: DisplayBid[],
    },
  ) {
    this.dataSource = data.transferReqs;
  }


  protected async acceptBid(bid: DisplayBid) {
    this.processing = true;
    try {

      const updatedPlayer = {
        ...this.data.player,
        teamId: bid.teamId,
        transferable: false,
        transferReqs: []
      };
      
      updatedPlayer.transferReqs = [];
      
      await this.playerSvc.updatePlayer(updatedPlayer);
      this.snackBar.open('Player transferred successfully', 'Close', {
        duration: 8000
      });
      
      this.dialogRef.close(true); 
    } catch (ex) {
      this.logger.error(ex);
      this.snackBar.open('Failed to transfer player', 'Close', {
        duration: 8000
      });
    } finally {
      this.processing = false;
    }
  }

  protected async rejectBid(bid: DisplayBid) {
    this.processing = true;
    try {

      const updatedTransferReqs = this.data.player.transferReqs.filter(
        (req: TransferRequest) => req.teamId !== bid.teamId
      );
      
      const updatedPlayer = {
        ...this.data.player,
        transferReqs: updatedTransferReqs
      };
      
      await this.playerSvc.updatePlayer(updatedPlayer);
      
      this.dataSource = this.dataSource.filter(b => b.teamId !== bid.teamId);
      
      this.snackBar.open('Bid rejected', 'Close', {
        duration: 3000
      });
    } catch (ex) {
      this.logger.error(ex);
      this.snackBar.open('Failed to reject bid', 'Close', {
        duration: 3000
      });
    } finally {
      this.processing = false;
    }
  }

  protected closeDialog() {
    this.dialogRef.close();
  }
}