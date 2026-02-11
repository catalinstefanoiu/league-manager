import { Router } from 'express';
import { authenticate } from '../auth-helper';
import { TransfersController } from '../controllers/transfers.controller';


const router = Router();
const ctrl = new TransfersController();

router.route('/players')
  .all(authenticate)
  .get(ctrl.getTransferables.bind(ctrl));

router.route('/bid')
  .all(authenticate)
  .post(ctrl.addTransferBid.bind(ctrl));
router.route('/unbid')
  .all(authenticate)
  .post(ctrl.removeTransferBid.bind(ctrl));
router.route('/accept')
  .all(authenticate)
  .post(ctrl.acceptBid.bind(ctrl));

router.route('/reject')
  .all(authenticate)
  .post(ctrl.rejectBid.bind(ctrl));

export default router;
