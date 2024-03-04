import { Router, json } from 'express';
import * as Z from 'zod';
import { transactionManager } from 'src/Controllers';
import {
	jsonSchema,
	zodValidateBody,
	zodValidateQuery,
} from 'src/Middlewares/Validation';
import { safeRequest } from 'src/Middlewares/SafeRequest';
import { useJWT } from 'src/Middlewares/Auth';

const TransactionRouter = Router();
TransactionRouter.use(json());
TransactionRouter.use(useJWT());

TransactionRouter.get(
	'/',
	safeRequest(async (req, res) => {
		const query = zodValidateQuery(
			Z.object({
				id: Z.string(),
			}),
			req
		);

		const { id } = query;
		const userData = await transactionManager.getTransactionById(id);

		res.send(userData);
	})
);

TransactionRouter.get(
	'/list',
	safeRequest(async (req, res) => {
		const { userId } = zodValidateQuery(
			Z.object({
				userId: Z.string(),
			}),
			req
		);

		console.log({ userId });

		const transactionList = await transactionManager.getTransactionListByUserId(
			userId
		);

		res.send(transactionList);
	})
);

TransactionRouter.post(
	'/',
	safeRequest(async (req, res) => {
		const transactionData = zodValidateBody(
			Z.object({
				transactionRequestPayload: jsonSchema,
				transactionOrigin: Z.string().regex(/^(WA)$|^(MASTER)$/),
				amount: Z.number().gt(0),
				from: Z.string(),
				to: Z.string(),
				premium: Z.boolean().optional(),
			}),
			req
		);

		const userData = await transactionManager.addTransactionBetweenUsers({
			...transactionData,
			timestamp: new Date().getTime(),
			premium: transactionData.premium ?? false,
		});

		res.send(userData);
	})
);
export default TransactionRouter;
