import { Router } from 'express';
import { authenticate, authorizeRoles } from '../auth-helper';
import { AdminUsersController } from '../controllers/admin-users.controller';
import { UserRole } from '../models/user.model';


const router = Router();
const ctrl = new AdminUsersController();

router.route('/')
  .all(authenticate)
  .get(ctrl.getUsers.bind(ctrl));

router.route('/:userId')
  .all(authorizeRoles([UserRole.AppAdmin]))
  .put(ctrl.updateUser.bind(ctrl));

export default router;
