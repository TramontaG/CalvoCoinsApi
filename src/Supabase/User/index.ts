import { client } from '../Instance';
import { returnResponse } from '../util';
const userDb = client.from('userData');

export type UserData = {
    id: string;
    userId: string;
    boundaryName: string;
    platform: string;
    lastPremiumBought: number;
    transactionHistory: any[];
    coins: number;
};

const UserManager = () => {
    const getUserByUserId = (userId: string) =>
        userDb.select('*').eq('userId', userId).then(returnResponse).then(resp => ({
            ...resp,
            data: resp.data[0]
        }));

    const getUserById = (id: string) =>
        userDb.select('*').eq('id', id).then(returnResponse).then(resp => ({
            ...resp,
            data: resp.data[0]
        }));

    const updateUserFromUserId = (userId: string, newData: Partial<UserData>) =>
        userDb.update(newData).eq('userId', userId).select().then(returnResponse);

    return {
        getUserByUserId,
        getUserById,
        updateUserFromUserId,
    };
};

export const userManager = UserManager();
