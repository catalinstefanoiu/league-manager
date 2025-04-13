import { Component, inject, model, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA, MatDialogActions,
  MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { LoggerService } from '../../../services/logger.service';

type DialogData = {
  home: {
    name: string;
    logo: string;
    gf: number;
  };
  away: {
    name: string;
    logo: string;
    gf: number;
  };
};

@Component({
  selector: 'app-add-score',
  imports: [
    FormsModule,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule
  ],
  templateUrl: './add-score-dialog.component.html',
  styleUrl: './add-score-dialog.component.scss'
})
export class AddScoreDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AddScoreDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly logger = inject(LoggerService);
  readonly score = model(this.data);

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
