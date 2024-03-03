import { Router, json } from 'express';
import * as Z from 'zod';
import { userManager } from 'src/Controllers';
import {
	isDefaultError,
	zodValidateBody,
	zodValidateQuery,
} from 'src/Middlewares/Validation';

const UserRouter = Router();
UserRouter.use(json());

UserRouter.get('/', async (req, res) => {
	try {
		const query = zodValidateQuery(
			Z.object({
				userId: Z.string(),
			}),
			req
		);

		const { userId } = query;

		const userData = await userManager.getUserByUserId(userId);

		res.send(userData);
	} catch (e) {
		if (isDefaultError(e)) {
			res.status(e.code).send(e.message);
		}
	}
});

UserRouter.patch('/', async (req, res) => {
	try {
		const query = zodValidateBody(
			Z.object({
				userId: Z.string(),
				data: Z.object({
					coins: Z.number().gt(0).optional(),
					lastPremiumBought: Z.number().gt(0).optional(),
					premiumValidUntil: Z.number().gt(0).optional(),
				}),
			}),
			req
		);

		const { userId } = query;
		const userData = await userManager.updateUserFromUserId(userId, query.data);

		res.send(userData);
	} catch (e) {
		if (isDefaultError(e)) {
			res.status(e.code).send(e.message);
		}
	}
});

UserRouter.post('/', async (req, res) => {
	try {
		const query = zodValidateBody(
			Z.object({
				userId: Z.string(),
				coins: Z.number().gt(0).optional(),
			}),
			req
		);

		const { userId, coins } = query;
		const userData = await userManager.createUser(userId, coins);

		console.log(userData);

		res.send(userData);
	} catch (e) {
		if (isDefaultError(e)) {
			res.status(e.code).send(e.message);
		}
	}
});
export default UserRouter;
