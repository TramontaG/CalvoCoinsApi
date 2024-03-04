import { returnResponse } from 'src/Controllers/util';
import { userManager } from '../User';
import { DbManager } from 'src/Database';
import { AllEntitiesModel } from 'src/Database/schemas';
import Crypto from 'crypto';
import { FieldValue, Filter } from 'firebase-admin/firestore';

const transactionDb = DbManager('transaction');

const TransactionManager = () => {
	const getTransactionById = (id: string) => transactionDb.readEntity(id);

	const addTransactionBetweenUsers = async (
		transactionData: AllEntitiesModel['transaction']
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
			coins: fromUser.coins - transactionData.amount,
		});

		await userManager.updateUserFromUserId(transactionData.to, {
			transactionHistory: FieldValue.arrayUnion(transactionId),
			coins: toUser.coins + transactionData.amount,
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
						'transactionRequestPayload'
					)
					.where(
						Filter.or(
							Filter.where('from', '==', userId),
							Filter.where('to', '==', 'userId')
						)
					)
			)
		);
	};

	return {
		getTransactionById,
		addTransactionBetweenUsers,
		getTransactionListByUserId,
	};
};

export const transactionManager = TransactionManager();
