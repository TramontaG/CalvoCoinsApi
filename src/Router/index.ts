import { Router } from 'express';
import UserRouter from './User';
import TransactionRouter from './Transaction';

const GeneralRouter = Router();

GeneralRouter.use('/user', UserRouter);
GeneralRouter.use('/transactions', TransactionRouter);

export default GeneralRouter;
