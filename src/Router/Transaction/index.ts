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

		const transactionList = await transactionManager.getTransactionListByUserId(
			userId
		);

		res.send(transactionList);
	})
);

TransactionRouter.get(
	'/list/debt',
	safeRequest(async (req, res) => {
		const { userId } = zodValidateQuery(
			Z.object({
				userId: Z.string(),
			}),
			req
		);

		const transactionList = await transactionManager.getDebtListFromUserId(userId);

		res.send(transactionList);
	})
);

TransactionRouter.get(
	'/list/credit',
	safeRequest(async (req, res) => {
		const { userId } = zodValidateQuery(
			Z.object({
				userId: Z.string(),
			}),
			req
		);

		const transactionList = await transactionManager.getCreditListFromUserId(userId);

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
				premiumSpending: Z.boolean().optional(),
			}),
			req
		);

		const response = await transactionManager.addTransactionBetweenUsers({
			...transactionData,
			timestamp: new Date().getTime(),
			premium: false,
			premiumSpending: !!transactionData.premiumSpending,
		});

		res.send(response);
	})
);

export default TransactionRouter;
