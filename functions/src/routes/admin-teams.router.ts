import { Router } from 'express';
import { authenticate } from '../auth-helper';
import { AdminTeamsController } from '../controllers/admin-teams.controller';


const router = Router();
const ctrl = new AdminTeamsController();

router.route('/')
  .all(authenticate)
  .get(ctrl.getTeams.bind(ctrl));

export default router;
