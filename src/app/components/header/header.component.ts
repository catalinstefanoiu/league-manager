import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    AsyncPipe,
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
  protected user$ = this.authSvc.user$;
  protected userRole$ = this.authSvc.userRole$;
  protected UserRole = UserRole;
  protected userRole: UserRole = UserRole.User;

  async ngOnInit(): Promise<void> {
    this.userRole$.subscribe((userRole) => this.userRole = userRole);
  }
}
