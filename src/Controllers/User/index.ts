import { DbManager } from 'src/Database';
import { AllEntitiesModel, DatabaseFriendlyEntityModel } from 'src/Database/schemas';
import Crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { transactionManager } from '../Transaction';
import { date } from 'zod';

const UserDB = DbManager('user');

const UserManager = () => {
	const getUserByUserId = async (userId: string) => {
		const users = await UserDB.runQuery(
			UserDB.createQuery(query => {
				return query
					.select(
						'coins',
						'id',
						'lastPremiumBought',
						'premiumValidUntil',
						'transactionHistory',
						'userId'
					)
					.where('userId', '==', userId);
			})
		);

		if (users.length > 1) {
			console.warn('multiple users with same UserID, returning first result');
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

	const assertUniqueUser = (userId: string) => {
		return UserDB.runQuery(
			UserDB.createQuery(query => {
				return query.select('id').where('userId', '==', userId);
			})
		).then(user => user.length > 0);
	};

	const createUser = async (userId: string, initialBalance = 0) => {
		const userAlreadyThere = await assertUniqueUser(userId);

		if (userAlreadyThere) {
			throw {
				code: 400,
				message: 'UserID unavailable.',
			};
		}

		const randomUUID = Crypto.randomUUID();
		return UserDB.upsertEntity(randomUUID, {
			id: randomUUID,
			userId: userId,
			coins: initialBalance,
			lastPremiumBought: 0,
			premiumValidUntil: 0,
			transactionHistory: [],
		});
	};

	const addBalance = async (userId: string, amount: number, payload: any) => {
		const now = new Date().getTime();

		const transactionData: AllEntitiesModel['transaction'] = {
			amount,
			from: 'MASTER',
			to: userId,
			premium: false,
			timestamp: now,
			transactionOrigin: 'CalvoCoinsApi',
			transactionRequestPayload: payload,
		};

		return transactionManager.addTransactionBetweenUsers(transactionData);
	};

	const spendCoins = async (userId: string, amount: number, payload: any) => {
		const { coins, premiumValidUntil } = await getUserByUserId(userId);

		const now = new Date().getTime();
		const hasEnoughCoins = coins >= amount;
		const hasPremiumValid = now < premiumValidUntil;

		const transactionData: AllEntitiesModel['transaction'] = {
			amount,
			from: userId,
			to: 'MASTER',
			premium: false,
			timestamp: now,
			transactionOrigin: 'CalvoCoinsApi',
			transactionRequestPayload: payload,
		};

		if (hasPremiumValid) {
			return transactionManager.addTransactionBetweenUsers({
				...transactionData,
				amount: 0,
			});
		}

		if (hasEnoughCoins) {
			return transactionManager.addTransactionBetweenUsers(transactionData);
		}

		throw {
			code: 402,
			message: 'Insufficient balance',
		};
	};

	return {
		getUserByUserId,
		getUserById,
		updateUserFromUserId,
		updateUserFromId,
		createUser,
		addBalance,
		spendCoins,
	};
};

export const userManager = UserManager();
