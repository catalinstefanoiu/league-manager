import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction
} from 'express';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';
import { UserRole } from './models/user.model';


enum CustomClaimField {
  role = 'role',
  team = 'team'
}

export interface ICustomRequest extends ExpressRequest {
  user: UserRecord;
}


export async function authenticate(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(401).send('Not authenticated');
    return;
  }

  try {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    const decodedIdToken = await getAuth().verifyIdToken(idToken);
    (req as ICustomRequest).user = await getAuth().getUser(decodedIdToken.uid);
    next();
    return;
  } catch (ex) {
    logger.error(ex);
    res.status(401).send('Not authenticated');
    return;
  }
}

export function authorizeRoles(roles: UserRole[]) {
  return async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      res.status(401).send('Not authenticated');
      return;
    }

    try {
      const idToken = req.headers.authorization.split('Bearer ')[1];
      const decodedIdToken = await getAuth().verifyIdToken(idToken);
      const user = await getAuth().getUser(decodedIdToken.uid);
      if (roles.includes(user.customClaims?.[CustomClaimField.role])) {
        (req as ICustomRequest).user = user;
        next();
        return;
      }
      res.status(403).send('Not authorized');
      return;
    } catch (ex) {
      logger.error(ex);
      res.status(401).send('Not authenticated');
      return;
    }
  };
}

export function getAuthUser(req: ExpressRequest): UserRecord | null {
  return (req as ICustomRequest).user;
}
