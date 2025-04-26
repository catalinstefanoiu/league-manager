import { Request, Response } from 'express';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { Team, TeamConverter } from '../models/team.model';
import { COL_FIXTURES, COL_TEAMS } from '../models/constants';
import { ICustomRequest } from '../auth-helper';


type DBFixtureMatch = {
  homeTeam: {
    id: string;
    gf: number;
  };
  awayTeam: {
    id: string;
    gf: number;
  };
  date: Date;
  round: number;
  played: boolean;
};

type FixtureMatch = {
  fid: string;
  homeTeam: {
    id: string;
    name: string;
    logo: string;
    gf: number;
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string;
    gf: number;
  };
  date: Date;
  round: number;
  played: boolean;
};

type UITeam = {
  tid: string;
  name: string;
  logo: string;
  coachId: string;
  managerId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export class ChampionshipController {
  public async getStandings(_: Request, res: Response): Promise<void> {
    try {
      const firestore = getFirestore();
      const teamsCol = firestore.collection(COL_TEAMS).withConverter(new TeamConverter());
      const snapshot = await teamsCol.get();
      const teams = new Map<string, UITeam>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        teams.set(data.tid, {
          ...data,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          gf: 0,
          ga: 0,
          gd: 0,
          points: 0
        });
        // teams.push({
        //   ...data
        // });
      });

      const fixturesCol = firestore.collection(COL_FIXTURES);
      const query = await fixturesCol.where('played', '==', true);
      const fixtures = await query.get();
      fixtures.forEach((doc) => {
        const fixture = doc.data() as DBFixtureMatch;
        const home = +(fixture.homeTeam.gf ?? 0);
        const away = +(fixture.awayTeam.gf ?? 0);

        const homeTeam = teams.get(fixture.homeTeam.id)!;
        homeTeam.played = homeTeam.played + 1;
        homeTeam.won = homeTeam.won + (home > away ? 1 : 0);
        homeTeam.drawn = homeTeam.drawn + (home === away ? 1 : 0);
        homeTeam.lost = homeTeam.lost + (home < away ? 1 : 0);
        homeTeam.gf = homeTeam.gf + home;
        homeTeam.ga = homeTeam.ga + away;
        homeTeam.gd = homeTeam.gf - homeTeam.ga;
        homeTeam.points = homeTeam.points + (home === away ? 1 : (home > away ? 3 : 0));

        const awayTeam = teams.get(fixture.awayTeam.id)!;
        awayTeam.played = awayTeam.played + 1;
        awayTeam.won = awayTeam.won + (home < away ? 1 : 0);
        awayTeam.drawn = awayTeam.drawn + (home === away ? 1 : 0);
        awayTeam.lost = awayTeam.lost + (home > away ? 1 : 0);
        awayTeam.gf = awayTeam.gf + away;
        awayTeam.ga = awayTeam.ga + home;
        awayTeam.gd = awayTeam.gf - awayTeam.ga;
        awayTeam.points = awayTeam.points + (home === away ? 1 : (home < away ? 3 : 0));
      });

      const ts = Array.from(teams, ([tid, team]) => team);
      res.status(200).json(ts);
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }

  public async getFixtures(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('getFixtures', req.query);
      const round = parseInt((req.query.round as string) || '0', 10);
      logger.debug('getFixtures round:', round);
      const firestore = getFirestore();
      const fixturesCol = firestore.collection(COL_FIXTURES);
      let query = await fixturesCol.orderBy('round');

      if (round > 0) {
        query = query.where('round', '==', round);
      }
      const snapshot = await query.get();

      const fixtures: FixtureMatch[] = [];
      const teams = new Map<string, Team>();

      logger.debug('Fixtures:', snapshot.size);
      for (const doc of snapshot.docs) {
        const data = doc.data() as DBFixtureMatch;
        let homeTeam: Team | undefined;
        let awayTeam: Team | undefined;
        if (teams.has(data.homeTeam.id)) {
          homeTeam = teams.get(data.homeTeam.id);
        } else {
          const homeTeamRef = firestore
            .collection(COL_TEAMS)
            .withConverter(new TeamConverter())
            .doc(data.homeTeam.id);
          homeTeam = (await homeTeamRef.get()).data();
          if (homeTeam) {
            teams.set(data.homeTeam.id, homeTeam);
          }
        }
        if (teams.has(data.awayTeam.id)) {
          awayTeam = teams.get(data.awayTeam.id);
        } else {
          const awayTeamRef = firestore
            .collection(COL_TEAMS)
            .withConverter(new TeamConverter())
            .doc(data.awayTeam.id);
          awayTeam = (await awayTeamRef.get()).data();
          if (awayTeam) {
            teams.set(data.awayTeam.id, awayTeam);
          }
        }

        const fixtureMatch: FixtureMatch = {
          fid: doc.id,
          homeTeam: {
            id: data.homeTeam.id,
            name: homeTeam?.name || '',
            logo: homeTeam?.logo || '',
            gf: data.homeTeam.gf
          },
          awayTeam: {
            id: data.awayTeam.id,
            name: awayTeam?.name || '',
            logo: awayTeam?.logo || '',
            gf: data.awayTeam.gf
          },
          date: data.date,
          round: data.round,
          played: data.played
        };
        fixtures.push(fixtureMatch);
      }

      res.status(200).json(fixtures);
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }

  public async getCurrentRound(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('getCurrentRound', req.query);
      const firestore = getFirestore();
      const fixturesCol = firestore.collection(COL_FIXTURES);
      const query = await fixturesCol
        .where('played', '==', true)
        .orderBy('round', 'desc');
      const snapshot = await query.get();

      const fixtures: FixtureMatch[] = [];
      const teams = new Map<string, Team>();

      logger.debug('Fixtures:', snapshot.size);
      let round = 0;
      for (const doc of snapshot.docs) {
        const data = doc.data() as DBFixtureMatch;
        if (round === 0) {
          round = data.round;
        }
        if (data.round !== round) {
          break;
        }

        let homeTeam: Team | undefined;
        let awayTeam: Team | undefined;
        if (teams.has(data.homeTeam.id)) {
          homeTeam = teams.get(data.homeTeam.id);
        } else {
          const homeTeamRef = firestore
            .collection(COL_TEAMS)
            .withConverter(new TeamConverter())
            .doc(data.homeTeam.id);
          homeTeam = (await homeTeamRef.get()).data();
          if (homeTeam) {
            teams.set(data.homeTeam.id, homeTeam);
          }
        }
        if (teams.has(data.awayTeam.id)) {
          awayTeam = teams.get(data.awayTeam.id);
        } else {
          const awayTeamRef = firestore
            .collection(COL_TEAMS)
            .withConverter(new TeamConverter())
            .doc(data.awayTeam.id);
          awayTeam = (await awayTeamRef.get()).data();
          if (awayTeam) {
            teams.set(data.awayTeam.id, awayTeam);
          }
        }

        const fixtureMatch: FixtureMatch = {
          fid: doc.id,
          homeTeam: {
            id: data.homeTeam.id,
            name: homeTeam?.name || '',
            logo: homeTeam?.logo || '',
            gf: data.homeTeam.gf
          },
          awayTeam: {
            id: data.awayTeam.id,
            name: awayTeam?.name || '',
            logo: awayTeam?.logo || '',
            gf: data.awayTeam.gf
          },
          date: data.date,
          round: data.round,
          played: data.played
        };
        fixtures.push(fixtureMatch);
      }

      res.status(200).json(fixtures);
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }

  public async insertFixtures(req: Request, res: Response): Promise<void> {
    const creq = req as ICustomRequest;

    try {
      const fixtures = creq.body.fixtures;
      if (!fixtures) {
        res.status(406).send('fixtures is mandatory');
        return;
      }

      const firestore = getFirestore();

      // Delete previous fixtures
      await this.deleteCollection(firestore, COL_FIXTURES, 100);

      // Insert new fixtures
      for (const fixture of fixtures) {
        const fixtureRef = firestore.collection(COL_FIXTURES).doc();
        await fixtureRef.set({
          ...fixture,
          // played: false,
          createdBy: creq.user.uid,
          createdAt: new Date(),
          updatedBy: creq.user.uid,
          updatedAt: new Date()
        });
      }

      //// Reset team standings
      // const teamsCol = firestore.collection(COL_TEAMS).withConverter(new TeamConverter());
      // const snapshot = await teamsCol.get();
      // for (const team of snapshot.docs) {
      //   const teamRef = firestore.collection(COL_TEAMS).doc(team.id);
      //   await teamRef.update({
      //     played: 0,
      //     won: 0,
      //     drawn: 0,
      //     lost: 0,
      //     gf: 0,
      //     ga: 0,
      //     points: 0
      //   });
      // }

      res.status(200).send();
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }

  public async updateFixtureScore(req: Request, res: Response): Promise<void> {
    const creq = req as ICustomRequest;

    try {
      const fixtureId = creq.params.fixtureId;
      const away = +(creq.body.away ?? '-1');
      const home = +(creq.body.home ?? '-1');
      logger.debug(fixtureId, creq.body, home, away);
      if (!fixtureId || away < 0 || home < 0) {
        res.status(406).send({ error: 'missing required params' });
        return;
      }

      const firestore = getFirestore();
      const fixtureRef = firestore.collection(COL_FIXTURES).doc(fixtureId);
      await fixtureRef.update({
        'awayTeam.gf': away,
        'homeTeam.gf': home,
        played: true,
        updatedBy: creq.user.uid,
        updatedAt: new Date()
      });

      // const fixtureData = (await fixtureRef.get()).data() as FixtureMatch;
      // const homeRef = firestore.collection(COL_TEAMS).doc(fixtureData.homeTeam.id);
      // const homeData = (await homeRef.get()).data() as Team;
      // const awayRef = firestore.collection(COL_TEAMS).doc(fixtureData.awayTeam.id);
      // const awayData = (await awayRef.get()).data() as Team;

      // await homeRef.update({
      //   played: (homeData.played ?? 0) + 1,
      //   won: (homeData.won ?? 0) + (home > away ? 1 : 0),
      //   drawn: (homeData.drawn ?? 0) + (home === away ? 1 : 0),
      //   lost: (homeData.lost ?? 0) + (home < away ? 1 : 0),
      //   gf: (homeData.gf ?? 0) + home,
      //   ga: (homeData.ga ?? 0) + away,
      //   points: (homeData.points ?? 0) + (home === away ? 1 : (home > away ? 3 : 0))
      // });

      // await awayRef.update({
      //   played: (awayData.played ?? 0) + 1,
      //   won: (awayData.won ?? 0) + (home < away ? 1 : 0),
      //   drawn: (awayData.drawn ?? 0) + (home === away ? 1 : 0),
      //   lost: (awayData.lost ?? 0) + (home > away ? 1 : 0),
      //   gf: (awayData.gf ?? 0) + away,
      //   ga: (awayData.ga ?? 0) + home,
      //   points: (awayData.points ?? 0) + (home === away ? 1 : (home < away ? 3 : 0))
      // });

      res.status(200).send();
    } catch (ex) {
      logger.error(ex);
      res.status(500).send('Unknown server error');
    }
  }

  private async deleteCollection(
    firestore: FirebaseFirestore.Firestore,
    collectionPath: string,
    batchSize: number
  ): Promise<void> {
    const collectionRef = firestore.collection(collectionPath);
    const query = collectionRef.limit(batchSize);

    return new Promise((resolve, reject) => {
      this.deleteQueryBatch(firestore, query, resolve).catch(reject);
    });
  }

  private async deleteQueryBatch(
    firestore: FirebaseFirestore.Firestore,
    query: FirebaseFirestore.Query,
    resolve: () => void
  ): Promise<void> {
    const snapshot = await query.get();
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve();
      return;
    }

    // Delete documents in a batch
    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      this.deleteQueryBatch(firestore, query, resolve);
    });
  }
}
