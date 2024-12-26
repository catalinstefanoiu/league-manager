import { Request, Response } from 'express';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { Team, TeamConverter } from '../models/team.model';


export class AdminTeamsController {
  public async getTeams(_: Request, res: Response): Promise<void> {
    try {
      const firestore = getFirestore();
      const teamsCol = firestore.collection('teams').withConverter(new TeamConverter());
      const snapshot = await teamsCol
        .orderBy('name')
        .get();
      const teams: Team[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        teams.push({
          ...data
        });
      });

      res.status(200).json(teams);
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }
}
