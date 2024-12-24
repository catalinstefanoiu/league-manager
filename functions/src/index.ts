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

setGlobalOptions({
  region: 'europe-central2'
});

initializeApp();


export const helloWorld = onRequest({
  region: 'europe-central2'
}, (request, response) => {
  logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

export const setInitialAdmin = functions
  .region('europe-central2')
  .auth.user().onCreate(async (user) => {
    const admins = ['dev.stefanoiu@gmail.com'];
    if (
      user.email &&
      user.emailVerified &&
      admins.includes(user.email)
    ) {
      const customClaims = {
        role: UserRole.AppAdmin
      };

      try {
        await getAuth().setCustomUserClaims(user.uid, customClaims);
        logger.info(`custom claims set on ${user.email}`);
      } catch (ex) {
        logger.error(ex, { structuredData: true });
      }
    }
  });
