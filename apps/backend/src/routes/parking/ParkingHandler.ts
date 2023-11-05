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
    start_price_euros: Type.Number(),
    bin_increment: Type.Number(),
    disabled: Type.Boolean(),
    electric: Type.Boolean(),
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
        id: parkingResponse.data.id as string,
        zone: req.body.zone,
        start_price_euros: req.body.start_price_euros,
        disabled: req.body.disabled,
        electric: req.body.electric,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        bid_increment: req.body.bin_increment,
        occupied: false,
        custom: true,
        current_bid: 0,
        current_buy_now_price_euros: req.body.start_price_euros * 2,
        average_buy_price: 0,
        bought_times: 0,
        last_bid_username: "None",
        last_bid_time: BigInt(0),
        occupied_by: "Unknown",
    };

    await Database.insertInto("parking_spots", parkingSpot);

    return respond(res, StatusCodes.OK, parkingSpot);
});

ParkingHandler.get("/:id", async (req, res) => {
    await extractUser(req);
    const parkingSpot = await Database.selectOneFrom("parking_spots", "*", {
        id: req.params.id,
    });

    if (!parkingSpot) throw new SafeError(StatusCodes.NOT_FOUND);

    return respond(res, StatusCodes.OK, parkingSpot);
});

ParkingHandler.post("/:id/bid", async (req, res) => {
    const user = await extractUser(req);

    const parkingSpot = await Database.selectOneFrom("parking_spots", "*", {
        id: req.params.id,
    });

    if (!parkingSpot) throw new SafeError(StatusCodes.NOT_FOUND);

    const nextBid = Math.max(
        parkingSpot.start_price_euros,
        parkingSpot.current_bid + parkingSpot.bid_increment
    );

    await Database.update(
        "parking_spots",
        {
            current_bid: nextBid,
            last_bid_username: user.username,
            current_buy_now_price_euros: nextBid * 2,
            last_bid_time: BigInt(Date.now()),
        },
        {
            id: parkingSpot.id,
        }
    );

    setTimeout(async () => {
        const spot = await Database.selectOneFrom("parking_spots", "*", {
            id: parkingSpot.id,
        });

        if (
            !(
                spot &&
                !spot.occupied &&
                spot.last_bid_username === user.username &&
                spot.current_bid === nextBid
            )
        )
            return;

        await Database.update(
            "parking_spots",
            {
                occupied: true,
                occupied_by: user.username,
                last_bid_time: BigInt(0),
            },
            {
                id: parkingSpot.id,
            }
        );
    }, 20_000);

    return respond(res, StatusCodes.OK, parkingSpot);
});

const ReserveSchema = Type.Object({
    endH: Type.Number(),
    endM: Type.Number(),
});

ParkingHandler.post("/:id/buy_now", useValidation(ReserveSchema), async (req, res) => {
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
