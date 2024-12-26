/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 *
 * https://firebase.google.com/docs/functions/typescript
 */

import { initializeApp } from 'firebase-admin/app';
import { logger } from 'firebase-functions';
import * as functions from 'firebase-functions/v1';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';
import { UserRole } from './user';
import { getAuth } from 'firebase-admin/auth';
import { expressApp } from './app';


setGlobalOptions({
  region: 'europe-central2'
});

initializeApp();


export const api = onRequest(
  {
    cors: [
      'https://localhost:5800',
      'https://192.168.5.27:5800'
    ]
  },
  expressApp
);

export const setInitialAdmin = functions
  .region('europe-central2')
  .auth.user().onCreate(async (user) => {
    const admins = ['dev.stefanoiu@gmail.com', 'stefanoiucatalin11@gmail.com'];
    if (user.email && user.emailVerified) {
      const customClaims = {
        role: UserRole.User
      };

      if (admins.includes(user.email)) {
        customClaims.role = UserRole.AppAdmin;
      }

      try {
        await getAuth().setCustomUserClaims(user.uid, customClaims);
        logger.info(`custom claims set on ${user.email} [${JSON.stringify(customClaims)}]`);
      } catch (ex) {
        logger.error(ex, { structuredData: true });
      }
    }
  });
