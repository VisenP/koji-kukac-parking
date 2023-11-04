import { ParkingSpot } from "@parking/models";
import { useMutation } from "react-query";

import { http, invalidateOnSuccess, MutationHandler } from "../../api/http";

type ReserveParkingSpotVariables = {
    endH: number;
    endM: number;
};

export const useReserveParkingSpot: MutationHandler<
    ReserveParkingSpotVariables,
    ParkingSpot,
    string
> = (parkingSpotId, options) =>
    useMutation(
        (variables) => http.post(`/parking/${parkingSpotId}/reserve`, variables),
        invalidateOnSuccess([["parking", parkingSpotId]], options)
    );
