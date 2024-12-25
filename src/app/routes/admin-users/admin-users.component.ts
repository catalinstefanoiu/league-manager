import { Component, inject, OnInit } from '@angular/core';
import { LoggerService } from '../../services/logger.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  private logger = inject(LoggerService);
  private adminSvc = inject(AdminService);

  async ngOnInit(): Promise<void> {
    try {
      const users = await this.adminSvc.getUsers();
      this.logger.debug(users);
    } catch (ex) {
      this.logger.error(ex);
    }
  }
}
