import { Component, Inject, inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService, UIFixtureMatch } from '../../../services/admin.service';
import { LoggerService } from '../../../services/logger.service';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-head-to-head',
  standalone: true,
  templateUrl: './head-to-head.component.html',
  styleUrl: './head-to-head.component.scss',
  imports: [MatDialogContent, DatePipe, MatDialogActions, MatButtonModule]
})
export class HeadToHeadComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private logger = inject(LoggerService);
  private dialogRef = inject(MatDialogRef<HeadToHeadComponent>);

  headToHead: UIFixtureMatch[] = [];
  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      homeTeamId: string;
      awayTeamId: string;
    }
  ) {}

homeMatches: UIFixtureMatch[] = [];
awayMatches: UIFixtureMatch[] = [];

async ngOnInit() {
  try {
    const allFixtures = await this.adminSvc.getFixtures();

    this.homeMatches = allFixtures
      .filter(f =>
        f.played &&
        (f.homeTeam.id === this.data.homeTeamId || f.awayTeam.id === this.data.homeTeamId)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    this.awayMatches = allFixtures
      .filter(f =>
        f.played &&
        (f.homeTeam.id === this.data.awayTeamId || f.awayTeam.id === this.data.awayTeamId)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  } catch (error) {
    this.logger.error('Failed to load team results', error);
  } finally {
    this.loading = false;
  }
}


  closeDialog() {
    this.dialogRef.close();
  }
}
