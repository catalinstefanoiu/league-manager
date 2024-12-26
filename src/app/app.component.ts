import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from "./components/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatIconModule,
    MatToolbarModule,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'League Manager';

  ngOnInit(): void {
    // prevent empty links from reloading the page
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && ['', '#'].indexOf(target.getAttribute('href')!) > -1) {
        e.preventDefault();
      }
    });
  }
}
