import { ParkingSpot } from "@parking/models";
import { useQuery } from "react-query";

import { http, QueryHandler, wrapAxios } from "../../api/http";

export const useAllParkingSpots: QueryHandler<ParkingSpot[]> = (options) =>
    useQuery({
        queryKey: ["parking"],
        queryFn: () => wrapAxios(http.get("/parking/")),
        ...options,
    });
