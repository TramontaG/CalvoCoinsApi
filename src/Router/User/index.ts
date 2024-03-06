import { Router, json } from 'express';
import * as Z from 'zod';
import { userManager } from 'src/Controllers';
import { zodValidateBody, zodValidateQuery } from 'src/Middlewares/Validation';
import { safeRequest } from 'src/Middlewares/SafeRequest';
import { useJWT } from 'src/Middlewares/Auth';

const UserRouter = Router();
UserRouter.use(json());
UserRouter.use(useJWT());

UserRouter.get(
	'/',
	safeRequest(async (req, res) => {
		const query = zodValidateQuery(
			Z.object({
				userId: Z.string(),
			}),
			req
		);

		const { userId } = query;

		const userData = await userManager.getUserByUserId(userId);

		res.send(userData);
	})
);

UserRouter.patch(
	'/',
	safeRequest(async (req, res) => {
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
	})
);

UserRouter.post(
	'/',
	safeRequest(async (req, res) => {
		const query = zodValidateBody(
			Z.object({
				userId: Z.string(),
				coins: Z.number().optional(),
			}),
			req
		);

		const { userId, coins } = query;
		const userData = await userManager.createUser(userId, coins);

		res.send(userData);
	})
);

UserRouter.post(
	'/add-balance',
	safeRequest(async (req, res) => {
		const { userId, amount, payload } = zodValidateBody(
			Z.object({
				userId: Z.string(),
				amount: Z.number().gt(0),
				payload: Z.any(),
			}),
			req
		);

		const response = await userManager.addBalance(userId, amount, payload);
		res.send(response);
	})
);

UserRouter.post(
	'/spend',
	safeRequest(async (req, res) => {
		const { userId, amount, payload } = zodValidateBody(
			Z.object({
				userId: Z.string(),
				amount: Z.number().gt(0),
				payload: Z.any(),
			}),
			req
		);

		const response = await userManager.spendCoins(userId, amount, payload);
		res.send(response);
	})
);

UserRouter.post(
	'/set-premium',
	safeRequest(async (req, res) => {
		const { premiumValidFor, userId, payload } = zodValidateBody(
			Z.object({
				userId: Z.string(),
				premiumValidFor: Z.number().gt(0),
				payload: Z.any(),
			}),
			req
		);

		const response = await userManager.setPremiumForUserId(
			userId,
			premiumValidFor,
			payload
		);
		res.send(response);
	})
);

export default UserRouter;
