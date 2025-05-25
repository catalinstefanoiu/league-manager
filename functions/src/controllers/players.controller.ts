import { Request, Response } from 'express';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { COL_PLAYERS } from '../models/constants';
import { Player, PlayerConverter } from '../models/player.model';


export class PlayersController {
  public async getPlayers(req: Request, res: Response): Promise<void> {
    try {
      const teamId = req.params.teamId;
      logger.debug(`players for teamId: ${teamId}`);
      const firestore = getFirestore();
      const playersCol = firestore.collection(COL_PLAYERS).withConverter(new PlayerConverter());
      const snapshot = await playersCol
        .where('teamId', '==', teamId)
        .orderBy('lastName')
        .orderBy('firstName')
        .get();
      const players: Player[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        players.push({
          ...data
        });
      });

      logger.debug(`players: ${players.length}`);
      res.status(200).json(players);
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }

  public async getPlayerById(req: Request, res: Response): Promise<void> {
    try {
      const pid = req.params.id;
      const firestore = getFirestore();
      const playerDoc = await firestore
      .collection(COL_PLAYERS)
      .doc(pid)
      .withConverter(new PlayerConverter())
      .get();

      if(!playerDoc.exists) {
        res.status(404).send('Player not found');
        return;
      }

      const player = playerDoc.data();
      res.status(200).json(player);

    } catch (error) {
      logger.error('Error fetching player:', error);
      res.status(500).send('Unknown server error');
    }
  }
}
