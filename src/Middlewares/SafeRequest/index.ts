import { RequestHandler } from 'express';
import { isDefaultError } from '../Validation';

export const safeRequest =
	(cb: RequestHandler): RequestHandler =>
	async (req, res, next) => {
		try {
			return await cb(req, res, next);
		} catch (e) {
			if (isDefaultError(e)) {
				res.status(e.code).send(e.message);
			} else {
				res.status(500).send(e);
			}
		}
	};
