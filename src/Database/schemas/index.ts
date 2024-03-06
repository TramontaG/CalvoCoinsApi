import { FieldValue } from 'firebase-admin/firestore';
import { Json } from 'src/Middlewares/Validation';

export type AllEntitiesModel = {
	user: {
		userId: string;
		coins: number;
		lastPremiumBought: number;
		premiumValidUntil: number;
		transactionHistory: string[];
	};
	transaction: {
		transactionRequestPayload: Json;
		transactionOrigin: string;
		amount: number;
		from: string;
		to: string;
		premium: boolean;
		premiumValidUntil?: number;
		premiumSpending: boolean;
		timestamp: number;
	};
};

export type EntityTypes = keyof AllEntitiesModel;

export type WithID<T extends keyof AllEntitiesModel> = {
	id: string;
} & AllEntitiesModel[T];

export type DatabaseFriendlyEntityModel<T extends keyof AllEntitiesModel> = {
	[key in keyof WithID<T>]: FieldValue | WithID<T>[key];
};
