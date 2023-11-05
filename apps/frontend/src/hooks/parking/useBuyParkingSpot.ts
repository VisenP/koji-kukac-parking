import { ParkingSpot } from "@parking/models";
import { useMutation } from "react-query";

import { http, invalidateOnSuccess, MutationHandler } from "../../api/http";

type ReserveParkingSpotVariables = {
    endH: number;
    endM: number;
};

export const useBuyParkingSpot: MutationHandler<
    ReserveParkingSpotVariables,
    ParkingSpot,
    string
> = (parkingSpotId, options) =>
    useMutation(
        (variables) => http.post(`/parking/${parkingSpotId}/buy_now`, variables),
        invalidateOnSuccess([["parking", parkingSpotId]], options)
    );
