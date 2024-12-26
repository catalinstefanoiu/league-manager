import { Router } from 'express';
import { authenticate } from '../auth-helper';
import { AdminUsersController } from '../controllers/admin-users.controller';


const router = Router();
const ctrl = new AdminUsersController();

router.route('/')
  .all(authenticate)
  .get(ctrl.getUsers.bind(ctrl));

export default router;
