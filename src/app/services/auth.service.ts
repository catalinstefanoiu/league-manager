import { inject, Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, ParsedToken, signInWithPopup, signOut, User, user } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LoggerService } from './logger.service';

export enum UserRole {
  User = 0,
  TeamManager,
  TeamAdmin,
  AppAdmin
}

// export interface IUserClaims {
//   aud: string;
//   auth_time?: Date;
//   email: string;
//   email_verified: boolean;
//   exp?: Date;
//   iat?: Date;
//   iss: string;
//   name: string;
//   picture: string;
//   role: UserRole;
//   sub?: string;
//   user_id: string;
// }

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private logger: LoggerService = inject(LoggerService);
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private messaging: Messaging = inject(Messaging);
  private router: Router = inject(Router);
  private provider = new GoogleAuthProvider();

  user$ = user(this.auth);
  currentUser: User | null = this.auth.currentUser;
  private userRole: BehaviorSubject<UserRole> = new BehaviorSubject<UserRole>(UserRole.User);
  public userRole$ = this.userRole.asObservable();

  constructor() {
    this.user$.subscribe(async (aUser: User | null) => {
      if (aUser) {
        try {
          const idTokenResult = await this.auth.currentUser?.getIdTokenResult();
          this.logger.debug('claims:', idTokenResult);
          this.userRole.next(idTokenResult?.claims['role'] as number ?? UserRole.User);
        } catch (ex) {
          this.logger.error(ex);
        }
      }
      this.currentUser = aUser;
    });
  }

  public async getToken(): Promise<string> {
    let token = '';
    try {
      if (this.auth.currentUser) {
        token = await this.auth.currentUser.getIdToken();
      }
    } catch (ex) {
      this.logger.error(ex);
    }

    return token;
  }

  public async getClaims(): Promise<ParsedToken | undefined> {
    try {
      const idTokenResult = await this.auth.currentUser?.getIdTokenResult(true);
      this.logger.debug('getClaims:', idTokenResult);
      this.userRole.next(idTokenResult?.claims['role'] as number ?? UserRole.User);
      return idTokenResult?.claims;
    } catch (error) {
      this.logger.error(error);
    }

    return undefined;
  }

  public login() {
    signInWithPopup(this.auth, this.provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      this.saveMessagingDeviceToken().then(() => {
        this.router.navigate(['/', 'home']);
        return credential;
      });
    });
  }

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/', 'login'])
      console.log('signed out');
    }).catch((error) => {
      console.log('sign out error: ' + error);
    });
  }

  // Requests permissions to show notifications.
  private async requestNotificationsPermissions() {
    this.logger.log('Requesting notifications permission...');
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      this.logger.log('Notification permission granted.');
      // Notification permission granted.
      await this.saveMessagingDeviceToken();
    } else {
      this.logger.log('Unable to get permission to notify.');
    }
  };

  private async saveMessagingDeviceToken() {
    try {
      const currentToken = await getToken(this.messaging);
      if (currentToken) {
        this.logger.log('Got FCM device token:', currentToken);
        // Saving the Device Token to Cloud Firestore.
        const tokenRef = doc(this.firestore, 'fcmTokens', currentToken);
        await setDoc(tokenRef, { uid: this.auth.currentUser?.uid });

        // This will fire when a message is received while the app is in the foreground.
        // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
        onMessage(this.messaging, (message) => {
          this.logger.log(
            'New foreground notification from Firebase Messaging!',
            message.notification
          );
        });
      } else {
        // Need to request permissions to show notifications.
        this.requestNotificationsPermissions();
      }
    } catch (error) {
      this.logger.error('Unable to get messaging token.', error);
    };
  };
}