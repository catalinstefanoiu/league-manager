import { Request, Response, Router } from 'express';
// import { getFirestore } from 'firebase-admin/firestore';
// import { logger } from 'firebase-functions';
// import { players } from './players';
// import { firestoreAutoId } from '../utils';


const router = Router();

router.route('/players')
  .get(noop);

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

export default router;
