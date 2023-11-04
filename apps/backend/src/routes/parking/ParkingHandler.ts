import { AdminPermissions, hasAdminPermission, ParkingSpot } from "@parking/models";
import { Type } from "@sinclair/typebox";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { Database } from "../../database/Database";
import { SafeError } from "../../errors/SafeError";
import { extractUser } from "../../extractors/extractUser";
import { generateSnowflake } from "../../lib/snowflake";
import { useValidation } from "../../middlewares/useValidation";
import { respond } from "../../utils/response";

const ParkingHandler = Router();

ParkingHandler.get("/", async (req, res) => {
    await extractUser(req);

    const parking_spots = await Database.selectFrom("parking_spots", "*");

    return respond(res, StatusCodes.OK, parking_spots);
});

const ParkingSchema = Type.Object({
    zone: Type.String(),
    latitude: Type.Number(),
    longitude: Type.Number(),
    occupied: Type.Boolean(),
});

ParkingHandler.post("/", useValidation(ParkingSchema), async (req, res) => {
    const user = await extractUser(req);

    if (!hasAdminPermission(user.permissions, AdminPermissions.ADD_PARKING_SPOT))
        throw new SafeError(StatusCodes.FORBIDDEN);
    // TODO: Post to their API

    const parkingSpot: ParkingSpot = {
        id: generateSnowflake().toString(),
        ...req.body,
    };

    await Database.insertInto("parking_spots", parkingSpot);

    return respond(res, StatusCodes.OK, parkingSpot);
});

ParkingHandler.delete("/:id", async (req, res) => {
    const user = await extractUser(req);

    if (!hasAdminPermission(user.permissions, AdminPermissions.REMOVE_PARKING_SPOT))
        throw new SafeError(StatusCodes.FORBIDDEN);

    const parkingSpot = await Database.selectOneFrom("parking_spots", ["id"], {
        id: req.params.id,
    });

    if (!parkingSpot) throw new SafeError(StatusCodes.NOT_FOUND);

    // TODO: Delete from their API

    await Database.deleteFrom("parking_spots", "*", {
        id: parkingSpot.id,
    });

    return respond(res, StatusCodes.OK, parkingSpot);
});

export default ParkingHandler;
