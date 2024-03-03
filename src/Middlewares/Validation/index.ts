import * as Zod from 'zod';
import { Request } from 'express';

type DefaultError = {
	code: number;
	message:
		| string
		| {
				errorIn: 'body' | 'query-params' | 'headers';
				issues: Zod.ZodError['issues'];
		  };
};

export const isDefaultError = (e: any): e is DefaultError => {
	return e.code && e.message;
};

export const getPropertyListFromObject = <T extends Object>(obj: T) => {
	return Object.entries(obj).reduce(
		(acc, [key, value]) => {
			acc[0].push(key);
			acc[1].push(value);
			return acc;
		},
		[new Array(), new Array()]
	);
};

export const zodValidateQuery = <Z>(zod: Zod.ZodType<Z>, req: Request) => {
	const query = zod.safeParse(req.query);
	if (!query.success) {
		throw {
			code: 400,
			message: { errorIn: 'query-params', issuses: query.error.issues },
		};
	} else {
		return query.data;
	}
};

export const zodValidateBody = <Z>(zod: Zod.ZodType<Z>, req: Request) => {
	const query = zod.safeParse(req.body);
	if (!query.success) {
		throw {
			code: 400,
			message: { errorIn: 'body', issuses: query.error.issues },
		};
	} else {
		return query.data;
	}
};

// code copied from https://zod.dev/?id=json-type
const literalSchema = Zod.union([
	Zod.string(),
	Zod.number(),
	Zod.boolean(),
	Zod.null(),
]);
type Literal = Zod.infer<typeof literalSchema>;
export type Json = Literal | { [key: string]: Json } | Json[];
export const jsonSchema: Zod.ZodType<Json> = Zod.lazy(() =>
	Zod.union([literalSchema, Zod.array(jsonSchema), Zod.record(jsonSchema)])
);
