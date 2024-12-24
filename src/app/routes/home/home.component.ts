import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private logger = inject(LoggerService);
  protected authSvc: AuthService = inject(AuthService);
  
  ngOnInit(): void {
    
  }
}
