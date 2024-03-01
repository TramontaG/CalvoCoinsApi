import { Router, json } from "express";
import * as Z from 'zod';
import { userManager } from 'src/Supabase';
import { isDefaultError, zodValidateBody, zodValidateQuery } from "src/Middlewares/Validation";

const UserRouter = Router();
UserRouter.use(json())

UserRouter.get("/", async (req, res) => {
    try {
        const query = zodValidateQuery(Z.object({
            userId: Z.string(),
        }), req);

        const { userId } = query;
        const userData = await userManager.getUserById(userId);

        res.send(userData);
    } catch (e) {
        if (isDefaultError(e)) {
            res.status(e.code).send(e.message);
        }
    }
});

UserRouter.patch("/", async (req, res) => {
    try {
        const query = zodValidateBody(Z.object({
            userId: Z.string(),
            data: Z.object({
                boundaryName: Z.string().optional(),
                platform: Z.string().optional(),
                transactionHistory: Z.array(Z.string()).optional(),
                coins: Z.number().gt(0).optional(),
                lastPremiumBought: Z.number().gt(0).optional()
            })
        }), req);

        const { userId } = query;
        const userData = await userManager.updateUserFromUserId(userId, query.data);

        res.send(userData);
    } catch (e) {
        if (isDefaultError(e)) {
            res.status(e.code).send(e.message);
        }
    }
});
export default UserRouter;