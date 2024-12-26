import { Router } from 'express';
import { authorizeRoles } from '../auth-helper';
import { AdminTeamsController } from '../controllers/admin-teams.controller';
import { UserRole } from '../models/user.model';


const router = Router();
const ctrl = new AdminTeamsController();

router.route('/')
  .all(authorizeRoles([UserRole.AppAdmin]))
  .get(ctrl.getTeams.bind(ctrl));

export default router;
