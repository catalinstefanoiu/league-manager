import { Router } from 'express';
import { authenticate } from '../auth-helper';
import { PlayersController } from '../controllers/players.controller';


const router = Router();
const ctrl = new PlayersController();

router.route('/:teamId')
  .all(authenticate)
  .get(ctrl.getPlayers.bind(ctrl));

export default router;
