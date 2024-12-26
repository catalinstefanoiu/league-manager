import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction
} from 'express';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';


interface ICustomRequest extends ExpressRequest {
  user: DecodedIdToken;
}


export async function authenticate(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    const decodedIdToken = await getAuth().verifyIdToken(idToken);
    (req as ICustomRequest).user = decodedIdToken;
    next();
    return;
  } catch (ex) {
    logger.error(ex);
    res.status(403).send('Unauthorized');
    return;
  }
};
