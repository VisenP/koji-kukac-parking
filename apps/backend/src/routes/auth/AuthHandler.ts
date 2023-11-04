import { User } from "@parking/models";
import { Type } from "@sinclair/typebox";
import { compare, hash } from "bcrypt";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { sign } from "jsonwebtoken";

import { Database } from "../../database/Database";
import { SafeError } from "../../errors/SafeError";
import { extractUser } from "../../extractors/extractUser";
import { Globals } from "../../globals";
import { Logger } from "../../lib/logger";
import { generateSnowflake } from "../../lib/snowflake";
import { useValidation } from "../../middlewares/useValidation";
import { reject, respond } from "../../utils/response";

const AuthHandler = Router();

const LoginSchema = Type.Object({
    email: Type.String(),
    password: Type.String(),
});

const RegisterSchema = Type.Object({
    email: Type.String(),
    username: Type.String(),
    password: Type.String(),
});

AuthHandler.get("/", async (req, res) => {
    Logger.info("Here!");
    const user = await extractUser(req);

    return respond(res, StatusCodes.OK, user);
});

AuthHandler.post("/login", useValidation(LoginSchema), async (req, res) => {
    const user = await Database.selectOneFrom("users", "*", { email: req.body.email });

    if (!user) throw new SafeError(StatusCodes.NOT_FOUND);

    const validPassword = await compare(req.body.password, user.password);

    if (!validPassword) throw new SafeError(StatusCodes.NOT_FOUND);

    const token = sign({ _id: user.id }, Globals.tokenSecret);

    return respond(res, StatusCodes.OK, {
        token: token,
    });
});

AuthHandler.post("/register", useValidation(RegisterSchema), async (req, res) => {
    const user = await Database.selectOneFrom("users", "*", { email: req.body.email });

    if (user) return reject(res, StatusCodes.CONFLICT);

    const hashPassword = await hash(req.body.password, 10);

    const newUser: User = {
        id: generateSnowflake(),
        email: req.body.email,
        username: req.body.username,
        password: hashPassword,
        permissions: BigInt(0),
    };

    await Database.insertInto("users", newUser);

    return res.status(200).send(newUser);
});

export default AuthHandler;
