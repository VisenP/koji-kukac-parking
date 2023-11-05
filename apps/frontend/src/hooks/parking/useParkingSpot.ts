import { ParkingSpot } from "@parking/models";
import { useQuery } from "react-query";

import { http, QueryHandler, wrapAxios } from "../../api/http";

export const useParkingSpot: QueryHandler<ParkingSpot, string> = (id, options) =>
    useQuery({
        queryKey: ["parking", id],
        queryFn: () => wrapAxios(http.get("/parking/" + id)),
        ...options,
    });
