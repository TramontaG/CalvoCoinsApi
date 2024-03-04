import axios, { isAxiosError } from 'axios';

const instance = axios.create({
	baseURL: 'http://gramont.ddns.net/auth',
});

type PermissionCheckResponse =
	| {
			success: true;
			newJwt: string;
	  }
	| {
			success: false;
	  };

/**
 * This is using the the API provided here: https://github.com/TramontaG/Authenticator
 * @param perms
 * @param jwt
 * @returns
 */
export const checkPermissions = async (perms: string[], jwt: string) => {
	try {
		const { data } = await instance.post<PermissionCheckResponse>(
			'/auth/jwt',
			{
				perms,
			},
			{
				headers: {
					Authorization: jwt,
				},
			}
		);

		return data.success;
	} catch (e) {
		if (isAxiosError(e)) {
			console.log(e.response);
			if (e.response!.status! > 499) {
				return undefined;
			} else {
				return false;
			}
		}
	}
};
