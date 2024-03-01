import { MessageReceivedByGateway, Platform } from 'kozz-types';
import { client } from 'src/Supabase/Instance';
import { returnResponse } from 'src/Supabase/util';

export type Transaction = {
	id: string;
	transactionRequestPayload: any;
	transactionOrigin: string;
	amount: number;
	from: string;
	to: string;
	premium: boolean;
	timestamp: number;
};

const transactionDb = client.from('Transactions');

const TransactionManager = () => {
	const getTransactionById = (id: string) =>
		transactionDb
			.select('*')
			.eq('id', id)
			.then(returnResponse)
			.then(resp => ({
				...resp,
				data: resp.data[0],
			}));

	const addTransactionBetweenUsers = async (transactionData: Transaction) => {
		const transaction = await transactionDb
			.insert(transactionData)
			.select()
			.then(returnResponse);

		console.log(transaction.data);
		return transaction;
	};

	return {
		getTransactionById,
		addTransactionBetweenUsers,
	};
};

export const transactionManager = TransactionManager();
