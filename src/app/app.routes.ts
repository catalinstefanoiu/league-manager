import { Routes } from '@angular/router';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { HomeComponent } from './routes/home/home.component';
import { LoginPageComponent } from './routes/public/login-page/login-page.component';
import { PrivacyPolicyComponent } from './routes/public/privacy-policy/privacy-policy.component';
import { AdminUsersComponent } from './routes/admin-users/admin-users.component';
import { AdminTeamsComponent } from './routes/admin-teams/admin-teams.component';
import { PlayersComponent } from './routes/admin-players/admin-players.component';
import { TransferablesComponent } from './routes/transferables/transferables.component';
import { ChampionshipComponent } from './routes/championship/championship.component';
import { FixturesComponent } from './routes/fixtures/fixtures.component';

const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const routes: Routes = [
  {
    path: '',
    component: LoginPageComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToHome },
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToHome },
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'fixtures',
    component: FixturesComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'admin-users',
    component: AdminUsersComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'players',
    component: PlayersComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'transferables',
    component: TransferablesComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'championship',
    component: ChampionshipComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'admin-teams',
    component: AdminTeamsComponent,
    canActivate: [AuthGuard],
    data: { AuthGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'pages/privacy-policy',
    component: PrivacyPolicyComponent
  }
];
