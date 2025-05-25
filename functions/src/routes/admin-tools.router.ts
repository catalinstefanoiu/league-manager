import { Request, Response, Router } from 'express';
// import { getFirestore } from 'firebase-admin/firestore';
// import { logger } from 'firebase-functions';
// import { getRandomInt } from '../utils';
// import { players } from './players';
// import { firestoreAutoId } from '../utils';


const router = Router();

router.route('/players')
  .get(noop);
  // .get(addPlayerMarketValue);

async function noop(_: Request, res: Response) {
  res.status(204).send('Nothing to be done');
}

// async function importPlayers(_: Request, res: Response) {
//   try {
//     const firestore = getFirestore();
//     const batch = firestore.batch();
//     players.forEach((p) => {
//       const ref = firestore.doc(`players/${firestoreAutoId()}`);
//       batch.set(ref, p);
//     });
//     await batch.commit();
//     res.status(200).send('Players imported');
//   } catch (ex) {
//     logger.error(ex);
//     res.status(500).json(ex);
//   }
// }

// async function addPlayerMarketValue(_: Request, res: Response) {
//   try {
//     const firestore = getFirestore();
//     const col = firestore.collection('players');
//     const players = await col.get();
//     players.forEach((doc) => {
//       const player = doc.data();
//       let marketValue = 300;
//       if (player.age < 25) {
//         marketValue += getRandomInt(50);
//       } else if (player.age < 30) {
//         marketValue += getRandomInt(30);
//       }
//       if (player.position === 'Portar') {
//         marketValue += getRandomInt(10);
//       } else if (player.position === 'Fundaș stânga' || player.position === 'Fundaș dreapta' || player.position === 'Fundaș central') {
//         marketValue += getRandomInt(20);
//       } else {
//         marketValue += getRandomInt(50);
//       }

//       player.marketValue = marketValue * 100;
//       col.doc(doc.id).set(player).then(() => logger.debug(`${doc.id}:${player.displayName} ${player.marketValue} saved`));
//     });
//     res.status(200).send('Players updated');
//   } catch (ex) {
//     logger.error(ex);
//     res.status(500).json(ex);
//   }
// }

export default router;
