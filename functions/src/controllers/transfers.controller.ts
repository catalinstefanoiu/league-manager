import { Request, Response } from 'express';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { Player, PlayerConverter, TransferRequest } from '../models/player.model';
import { COL_FCMTOKENS, COL_PLAYERS } from '../models/constants';
import { ICustomRequest } from '../auth-helper';
import { CustomClaims, UserRole } from '../models/user.model';
import { getUsers } from '../utils';


export class TransfersController {
  public async getTransferables(req: Request, res: Response): Promise<void> {
    const creq = req as ICustomRequest;
    const customClaims: CustomClaims = (creq.user.customClaims as CustomClaims) ?? { role: UserRole.User, team: '' };

    try {
      const firestore = getFirestore();
      const playersCol = firestore.collection(COL_PLAYERS).withConverter(new PlayerConverter());
      const snapshot = await playersCol
        .where('transferable', '==', true)
        .orderBy('teamId')
        .get();
      const players: Player[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const transferReqs: TransferRequest[] = [];
        data.transferReqs?.forEach((t) => {
          if (data.teamId === customClaims.team || t.teamId === customClaims.team) {
            transferReqs.push(t);
          }
        });

        players.push({
          ...data,
          displayName: `${data.firstName} ${data.lastName}`,
          transferReqs
        });
      });

      res.status(200).json(players);
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }

  public async addTransferBid(req: Request, res: Response): Promise<void> {
    const creq = req as ICustomRequest;
    const customClaims: CustomClaims = (creq.user.customClaims as CustomClaims) ?? { role: UserRole.User, team: '' };

    try {
      const playerId = creq.body.playerId;
      if (!playerId) {
        res.status(406).send('playerId is mandatory');
        return;
      }
      const value = creq.body.value;
      if (!value) {
        res.status(406).send('value is mandatory');
        return;
      }
      const firestore = getFirestore();
      const playerRef = firestore.doc(`${COL_PLAYERS}/${playerId}`).withConverter(new PlayerConverter());
      const player = (await playerRef.get()).data();
      if (!player) {
        res.status(404).send('player not found');
        return;
      }

      let exists = false;
      player.transferReqs?.forEach((t) => {
        if (t.teamId === customClaims.team) {
          exists = true;
        }
      });

      if (exists) {
        res.status(406).send('bid already exists');
        return;
      }

      const transferReqs: TransferRequest[] = player.transferReqs ?? [];
      transferReqs.push({
        teamId: customClaims.team,
        value,
        timestamp: new Date()
      });

      await playerRef.set({
        ...player,
        transferReqs
      });

      // Send notification to player owner
      const users = await getUsers();
      // logger.debug(users, { structuredData: true });
      const usersToSend: string[] = [];
      users.forEach((u) => {
        if (u.customClaims?.team === player.teamId) {
          usersToSend.push(u.uid);
        }
      });
      logger.debug(usersToSend, { structuredData: true });
      const notificationBody = `${creq.user.displayName} just made a bid for ${player.displayName} of €${value}`;
      logger.debug(notificationBody);
      const tokensCol = firestore.collection(COL_FCMTOKENS);
      const snapshot = await tokensCol
        .where('uid', 'in', usersToSend)
        .get();
      const tokens: string[] = [];
      snapshot.forEach((doc) => {
        tokens.push(doc.id);
      });
      logger.debug(tokens);

      const message: MulticastMessage = {
        notification: {
          title: 'Player bid',
          body: notificationBody
        },
        data: {
          type: 'bid',
          playerId: player.pid,
          value: `${value}`
        },
        tokens
      };
      const response = await getMessaging().sendEachForMulticast(message);
      logger.debug(response);

      res.status(200).send();
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }

  public async removeTransferBid(req: Request, res: Response): Promise<void> {
    const creq = req as ICustomRequest;
    const customClaims: CustomClaims = (creq.user.customClaims as CustomClaims) ?? { role: UserRole.User, team: '' };

    try {
      const playerId = creq.body.playerId;
      if (!playerId) {
        res.status(406).send('playerId is mandatory');
        return;
      }
      const firestore = getFirestore();
      const playerRef = firestore.doc(`${COL_PLAYERS}/${playerId}`).withConverter(new PlayerConverter());
      const player = (await playerRef.get()).data();
      if (!player) {
        res.status(404).send('player not found');
        return;
      }

      let exists = false;
      player.transferReqs?.forEach((t) => {
        if (t.teamId === customClaims.team) {
          exists = true;
        }
      });

      if (!exists) {
        res.status(406).send('bid does not exists');
        return;
      }

      if (player.transferReqs) {
        const transferReqs = player.transferReqs.filter((t) => t.teamId !== customClaims.team);

        await playerRef.set({
          ...player,
          transferReqs
        });
      }

      res.status(200).send();
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }
}
