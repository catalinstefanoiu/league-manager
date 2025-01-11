import express from 'express';
import cors from 'cors';
import versionInfo from './version.json';
import adminUsersRouter from './routes/admin-users.router';
import adminTeamsRouter from './routes/admin-teams.router';
import adminToolsRouter from './routes/admin-tools.router';
import transfers from './routes/transfers.router';


const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization,Origin,X-Requested-With,Accept,Cache-Control',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  maxAge: 30 * 60 * 1000
}));

app.get('/version', async (_, res) => {
  const ver = versionInfo || { version: 'v' };
  res.status(200).json(ver);
});

app.use('/admin-users', adminUsersRouter);
app.use('/admin-teams', adminTeamsRouter);
app.use('/admin-tools', adminToolsRouter);
app.use('/transfers', transfers);

export const expressApp = app;
