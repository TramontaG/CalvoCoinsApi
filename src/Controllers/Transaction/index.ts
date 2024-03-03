import { returnResponse } from 'src/Controllers/util';
import { userManager } from '../User';
import { DbManager } from 'src/Database';
import { AllEntitiesModel } from 'src/Database/schemas';
import Crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';

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

		console.log({ fromUser, toUser });

		const transactionId = Crypto.randomUUID();

		const transaction = await transactionDb.upsertEntity(transactionId, {
			id: transactionId,
			...transactionData,
		});

		console.log({ transaction });

		const result1 = await userManager.updateUserFromUserId(transactionData.from, {
			transactionHistory: FieldValue.arrayUnion(transactionId),
		});

		const result2 = await userManager.updateUserFromUserId(transactionData.to, {
			transactionHistory: FieldValue.arrayUnion(transactionId),
		});

		console.log({ result1, result2 });

		return transaction;
	};

	return {
		getTransactionById,
		addTransactionBetweenUsers,
	};
};

export const transactionManager = TransactionManager();
