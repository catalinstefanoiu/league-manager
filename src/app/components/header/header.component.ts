import { RouterLink } from '@angular/router';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  protected authSvc = inject(AuthService);
  protected user = this.authSvc.currentUser;
  protected userRole = this.authSvc.role;
  protected UserRole = UserRole;

  async ngOnInit(): Promise<void> {

  }
}
