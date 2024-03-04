import { RequestHandler } from 'express';
import { checkPermissions } from 'src/API/AuthApi';

export const useJWT = (): RequestHandler => async (req, res, next) => {
	const { authorization } = req.headers;

	if (!authorization) {
		return res.status(401).send('No JWT provided');
	}

	const success = await checkPermissions(['coins'], authorization as string);
	if (success) {
		return next();
	}

	if (success === false) {
		return res
			.status(403)
			.send("The provided JWT doesn't have permission to manage the coins");
	}

	return res.status(500).send('Unexpected error');
};
