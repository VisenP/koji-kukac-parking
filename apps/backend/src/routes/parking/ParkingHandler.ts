import { AdminPermissions, hasAdminPermission, ParkingSpot } from "@parking/models";
import { Type } from "@sinclair/typebox";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { parkingAxios } from "../../../api/evaluatorAxios";
import { Database } from "../../database/Database";
import { SafeError } from "../../errors/SafeError";
import { extractUser } from "../../extractors/extractUser";
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

    const [parkingResponse, error] = await parkingAxios
        .post<any>("https://hackathon.kojikukac.com/api/ParkingSpot", {
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            parkingSpotZone: req.body.zone,
        })
        .then((res) => [res, undefined])
        .catch((error) => [undefined, error]);

    if (error) throw new SafeError(StatusCodes.INTERNAL_SERVER_ERROR);

    const parkingSpot: ParkingSpot = {
        id: parkingResponse.data.id,
        ...req.body,
    };

    await Database.insertInto("parking_spots", parkingSpot);

    return respond(res, StatusCodes.OK, parkingSpot);
});

const ReserveSchema = Type.Object({
    endH: Type.Number(),
    endM: Type.Number(),
});

ParkingHandler.post("/:id/reserve", useValidation(ReserveSchema), async (req, res) => {
    const user = await extractUser(req);

    const parkingSpot = await Database.selectOneFrom("parking_spots", "*", {
        id: req.params.id,
    });

    if (!parkingSpot) throw new SafeError(StatusCodes.NOT_FOUND);

    if (parkingSpot.occupied) throw new SafeError(StatusCodes.CONFLICT);

    const [_, error] = await parkingAxios
        .post<any>("https://hackathon.kojikukac.com/api/ParkingSpot/reserve", {
            endH: req.body.endH,
            endM: req.body.endM,
            parkingSpotId: parkingSpot.id,
        })
        .then((res) => [res, undefined])
        .catch((error) => [undefined, error]);

    console.log(error);

    if (error) throw new SafeError(StatusCodes.INTERNAL_SERVER_ERROR);

    return respond(res, StatusCodes.OK, parkingSpot);
});

ParkingHandler.patch("/:id", useValidation(ParkingSchema), async (req, res) => {
    const user = await extractUser(req);

    if (!hasAdminPermission(user.permissions, AdminPermissions.EDIT_PARKING_SPOT))
        throw new SafeError(StatusCodes.FORBIDDEN);

    const parkingSpot = await Database.selectOneFrom("parking_spots", "*", {
        id: req.params.id,
    });

    if (!parkingSpot) throw new SafeError(StatusCodes.NOT_FOUND);

    await Database.update(
        "parking_spots",
        {
            ...req.body,
        },
        {
            id: parkingSpot.id,
        }
    );

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

    const [_, error] = await parkingAxios
        .delete("https://hackathon.kojikukac.com/api/ParkingSpot/" + parkingSpot.id)
        .then((res) => [res, undefined])
        .catch((error) => [undefined, error]);

    if (error) throw new SafeError(StatusCodes.INTERNAL_SERVER_ERROR);

    await Database.deleteFrom("parking_spots", "*", {
        id: parkingSpot.id,
    });

    return respond(res, StatusCodes.OK, parkingSpot);
});

export default ParkingHandler;
