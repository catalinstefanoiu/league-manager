import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';
import { UserRole } from '../models/user.model';
import { getUsers } from '../utils';


export class AdminUsersController {
  public async getUsers(_: Request, res: Response): Promise<void> {
    try {
      const users = await getUsers();
      // logger.debug(users, { structuredData: true });
      res.status(200).json(users);
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body || {
        role: UserRole.User,
        team: ''
      };
      const user = await getAuth().getUser(req.params.userId);
      if (!user) {
        res.status(404).send('Unknown user');
        return;
      }

      if (!user.emailVerified) {
        res.status(406).send('Invalid user');
        return;
      }

      await getAuth().setCustomUserClaims(user.uid, {
        role: body.role,
        team: body.team
      });

      res.status(200).send();
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }
}
