import { DbManager } from 'src/Database';
import { AllEntitiesModel, DatabaseFriendlyEntityModel } from 'src/Database/schemas';
import Crypto from 'crypto';

const UserDB = DbManager('user');

const UserManager = () => {
	const getUserByUserId = async (userId: string) => {
		const users = await UserDB.runQuery(
			UserDB.createQuery(query => {
				return query.select('id').where('userId', '==', userId);
			})
		);

		if (users.length > 1) {
			console.warn('multiple users with same ID, returning first result');
		}

		return users[0];
	};

	const getUserById = (id: string) => UserDB.readEntity(id);

	const updateUserFromUserId = async (
		userId: string,
		newData: Partial<DatabaseFriendlyEntityModel<'user'>>
	) => {
		const user = await getUserByUserId(userId);

		if (!user) {
			return;
		}

		return UserDB.upsertEntity(user.id, newData);
	};

	const updateUserFromId = async (
		id: string,
		newData: Partial<DatabaseFriendlyEntityModel<'user'>>
	) => {
		return UserDB.upsertEntity(id, newData);
	};

	const createUser = (id: string, initialBalance = 0) => {
		const randomUUID = Crypto.randomUUID();
		return UserDB.upsertEntity(randomUUID, {
			id: randomUUID,
			userId: id,
			coins: initialBalance,
			lastPremiumBought: 0,
			premiumValidUntil: 0,
			transactionHistory: [],
		});
	};

	return {
		getUserByUserId,
		getUserById,
		updateUserFromUserId,
		updateUserFromId,
		createUser,
	};
};

export const userManager = UserManager();
