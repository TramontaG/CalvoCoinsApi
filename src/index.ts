import dotenv from 'dotenv';

dotenv.config({
    path: ".env"
});

import express from 'express';
import GeneralRouter from './Router';

const app = express();

app.use("/", GeneralRouter);

app.listen(3515);