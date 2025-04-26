import { Router } from 'express';
import { authenticate, authorizeRoles } from '../auth-helper';
import { ChampionshipController } from '../controllers/championship.controller';
import { UserRole } from '../models/user.model';


const router = Router();
const ctrl = new ChampionshipController();

router.route('/standings')
  .all(authenticate)
  .get(ctrl.getStandings.bind(ctrl));

router.route('/fixtures')
  .all(authorizeRoles([UserRole.AppAdmin]))
  .post(ctrl.insertFixtures.bind(ctrl));
router.route('/fixtures')
  .get(authenticate, ctrl.getFixtures.bind(ctrl));
router.route('/fixtures/current-round')
  .get(authenticate, ctrl.getCurrentRound.bind(ctrl));
router.route('/fixtures/:fixtureId/score')
  .all(authorizeRoles([UserRole.AppAdmin]))
  .patch(ctrl.updateFixtureScore.bind(ctrl));

export default router;
