import { User } from "@parking/models";
import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload, verify } from "jsonwebtoken";

import { Database } from "../database/Database";
import { SafeError } from "../errors/SafeError";
import { Globals } from "../globals";
import { memoizedRequestExtractor } from "./MemoizedRequestExtractor";

const jwtSchema = Type.Object({
    _id: Type.String(),
});

const compiledSchema = TypeCompiler.Compile(jwtSchema);

const validateJwt = async (token?: string): Promise<User | null> => {
    let jwt: string | JwtPayload;

    try {
        jwt = verify(token ?? "", Globals.tokenSecret);
    } catch {
        return null;
    }

    if (!compiledSchema.Check(jwt)) {
        return null;
    }

    const user = await Database.selectOneFrom("users", "*", { id: jwt._id });

    return user ?? null;
};

export const extractUser = async (req: Request): Promise<User> => {
    return memoizedRequestExtractor(req, "__user", async () => {
        const auth = req.header("authorization");

        if (!(auth && auth.startsWith("Bearer "))) throw new SafeError(StatusCodes.UNAUTHORIZED);

        const token = auth.slice("Bearer ".length);

        const user = await validateJwt(token);

        if (user === null) throw new SafeError(StatusCodes.UNAUTHORIZED);

        return user;
    });
};
