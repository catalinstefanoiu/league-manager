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
import { AdminPlayersComponent } from './routes/admin-players/admin-players.component';
import { TransferablesComponent } from './routes/transferables/transferables.component';
import { ChampionshipComponent } from './routes/championship/championship.component';
import { FixturesComponent } from './routes/fixtures/fixtures.component';
import { PlayersComponent } from './routes/players/players.component';
import { PlayerDetailsComponent } from './routes/player-details/player-details.component';

const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const routes: Routes = [
  {
    path: '',
    title: 'Login',
    component: LoginPageComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToHome },
  },
  {
    path: 'login',
    title: 'Login',
    component: LoginPageComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToHome },
  },
  {
    path: 'home',
    title: 'Home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'fixtures',
    title: 'Fixtures',
    component: FixturesComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'players/details/:playerId',
    component: PlayerDetailsComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'players/:teamId',
    component: PlayersComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'admin-users',
    component: AdminUsersComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'admin-players',
    component: AdminPlayersComponent,
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
