import { DecodedIdToken, getAuth, UserRecord } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';
import express, {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction
} from 'express';
import cors from 'cors';
import versionInfo from './version.json';

interface ICustomRequest extends ExpressRequest {
  user: DecodedIdToken;
}

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization,Origin,X-Requested-With,Accept,Cache-Control',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  maxAge: 30 * 60 * 1000
}));

async function authenticate(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
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

app.get('/version', async (_, res) => {
  const ver = versionInfo || { version: 'v' };
  // logger.info(`getVersion: ${ver}`);
  res.status(200).json(ver);
});

app.get('/admin-users', authenticate, async (_, res) => {
  try {
    const users = await getUsers();
    // logger.debug(users, { structuredData: true });
    res.status(200).json(users);
  } catch (ex) {
    logger.error(ex);
  }
});

async function getUsers(users: UserRecord[] = [], nextPageToken?: string) {
  const result = await getAuth().listUsers(1000, nextPageToken);
  users = users.concat(result.users);
  if (result.pageToken) {
    return getUsers(users, result.pageToken);
  }

  return users;
}

export const expressApp = app;
