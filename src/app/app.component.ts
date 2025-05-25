import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from "./components/header/header.component";
import { LoadingIndicatorComponent } from "./components/loading-indicator/loading-indicator.component";
import { LoggerService } from './services/logger.service';
import { Messaging, onMessage } from '@angular/fire/messaging';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatIconModule,
    MatToolbarModule,
    HeaderComponent,
    LoadingIndicatorComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'League Manager';
  private router = inject(Router);
  private messaging = inject(Messaging);
  private logger = inject(LoggerService);

  ngOnInit(): void {
    // This will fire when a message is received while the app is in the foreground.
    // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
    onMessage(this.messaging, (message) => {
      this.logger.log(
        'New foreground notification from Firebase Messaging!',
        message
      );
      if (message.data?.['type'] === 'bid') {
        //TODO: handle bid
        this.logger.debug('handle bid');
      }
    });


    // prevent empty links from reloading the page
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && ['', '#'].indexOf(target.getAttribute('href')!) > -1) {
        e.preventDefault();
      }
    });
  }
}
