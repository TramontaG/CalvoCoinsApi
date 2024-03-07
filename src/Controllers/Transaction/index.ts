import { userManager } from '../User';
import { DbManager } from 'src/Database';
import { AllEntitiesModel } from 'src/Database/schemas';
import Crypto from 'crypto';
import { FieldValue, Filter } from 'firebase-admin/firestore';

const transactionDb = DbManager('transaction');

const TransactionManager = () => {
	const getTransactionById = (id: string) => transactionDb.readEntity(id);

	const addTransactionBetweenUsers = async (
		transactionData: AllEntitiesModel['transaction'] & {
			premiumSpending?: boolean;
		}
	) => {
		const fromUser = await userManager.getUserByUserId(transactionData.from);
		const toUser = await userManager.getUserByUserId(transactionData.to);

		if (!fromUser || !toUser) {
			return;
		}

		const transactionId = Crypto.randomUUID();

		const transaction = await transactionDb.upsertEntity(transactionId, {
			id: transactionId,
			...transactionData,
		});

		await userManager.updateUserFromUserId(transactionData.from, {
			transactionHistory: FieldValue.arrayUnion(transactionId),
			coins:
				fromUser.userId !== 'MASTER' || !transactionData.premiumSpending
					? FieldValue.increment(transactionData.amount * -1)
					: fromUser.coins,
		});

		await userManager.updateUserFromUserId(transactionData.to, {
			transactionHistory: FieldValue.arrayUnion(transactionId),
			coins: toUser.coins + transactionData.amount,
			premiumValidUntil:
				transactionData.premiumValidUntil ?? toUser.premiumValidUntil,
			lastPremiumBought: transactionData.premium
				? transactionData.timestamp
				: toUser.lastPremiumBought,
		});

		return transaction;
	};

	const getTransactionListByUserId = async (userId: string) => {
		return transactionDb.runQuery(
			transactionDb.createQuery(query =>
				query
					.select(
						'from',
						'to',
						'id',
						'premium',
						'timestamp',
						'transactionOrigin',
						'transactionRequestPayload',
						'amount'
					)
					.where(
						Filter.or(
							Filter.where('from', '==', userId),
							Filter.where('to', '==', userId)
						)
					)
					.orderBy('timestamp')
			)
		);
	};

	const getDebtListFromUserId = async (userId: string) => {
		return transactionDb.runQuery(
			transactionDb.createQuery(query =>
				query
					.select(
						'from',
						'to',
						'id',
						'premium',
						'timestamp',
						'transactionOrigin',
						'transactionRequestPayload'
					)
					.where('from', '==', userId)
			)
		);
	};

	const getCreditListFromUserId = async (userId: string) => {
		return transactionDb.runQuery(
			transactionDb.createQuery(query =>
				query
					.select(
						'from',
						'to',
						'id',
						'premium',
						'timestamp',
						'transactionOrigin',
						'transactionRequestPayload'
					)
					.where('to', '==', userId)
			)
		);
	};

	return {
		getTransactionById,
		addTransactionBetweenUsers,
		getTransactionListByUserId,
		getDebtListFromUserId,
		getCreditListFromUserId,
	};
};

export const transactionManager = TransactionManager();
