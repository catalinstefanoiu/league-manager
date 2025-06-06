import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderComponent } from "./components/header/header.component";
import { LoadingIndicatorComponent } from "./components/loading-indicator/loading-indicator.component";
import { LoggerService } from './services/logger.service';
import { Messaging, onMessage } from '@angular/fire/messaging';
import { TransferNotificationService } from './services/transfer-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatIconModule,
    MatToolbarModule,
    HeaderComponent,
    LoadingIndicatorComponent,
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'League Manager';

  private router = inject(Router);
  private messaging = inject(Messaging);
  private logger = inject(LoggerService);
  private snackBar = inject(MatSnackBar);
  private transferNotificationService = inject(TransferNotificationService);

  ngOnInit(): void {
    onMessage(this.messaging, (payload) => {
      this.logger.log('New foreground notification from Firebase Messaging!', payload);

      const type = payload.data?.['type'];
      const playerId = payload.data?.['playerId'];
      const value = payload.data?.['value'];
      const message = payload.notification?.body || 'New transfer notification!';

      if (type === 'bid') {
        this.snackBar.open(message, 'Close', { duration: 4000 });

        this.transferNotificationService.pushTransfer({
          playerId,
          value,
          message,
          timestamp: new Date()
        });
      }
    });

    // prevent empty links from reloading the page
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && ['', '#'].includes(target.getAttribute('href')!)) {
        e.preventDefault();
      }
    });
  }
}
