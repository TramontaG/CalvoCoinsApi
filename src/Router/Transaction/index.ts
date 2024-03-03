import { Router, json } from 'express';
import * as Z from 'zod';
import { userManager, transactionManager } from 'src/Controllers';
import {
	isDefaultError,
	jsonSchema,
	zodValidateBody,
	zodValidateQuery,
} from 'src/Middlewares/Validation';

const TransactionRouter = Router();
TransactionRouter.use(json());

TransactionRouter.get('/', async (req, res) => {
	try {
		const query = zodValidateQuery(
			Z.object({
				id: Z.string(),
			}),
			req
		);

		const { id } = query;
		const userData = await transactionManager.getTransactionById(id);

		res.send(userData);
	} catch (e) {
		if (isDefaultError(e)) {
			res.status(e.code).send(e.message);
		}
	}
});

TransactionRouter.post('/', async (req, res) => {
	try {
		const transactionData = zodValidateBody(
			Z.object({
				transactionRequestPayload: jsonSchema,
				// [TODO]: find a way to export the origin types
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
	} catch (e) {
		if (isDefaultError(e)) {
			res.status(e.code).send(e.message);
		}
	}
});
export default TransactionRouter;
