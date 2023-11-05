import { ParkingSpot } from "@parking/models";
import { useQuery } from "react-query";

import { http, QueryHandler, wrapAxios } from "../../api/http";

export const useParkingSpot: QueryHandler<ParkingSpot, string> = (id, options) =>
    useQuery({
        queryKey: ["parking", id],
        queryFn: () => wrapAxios(http.get("/parking/" + id)),
        ...options,
    });

export type ProfitData = {
    profit1d: bigint;
    profit7d: bigint;
    profit30d: bigint;
};

export const useParkingSpotAnalytics: QueryHandler<ProfitData, string> = (id, options) =>
    useQuery({
        queryKey: ["parking", id, "analytics"],
        queryFn: () => wrapAxios(http.get("/parking/" + id + "/analytics")),
        ...options,
    });

export const useGlobalProfit: QueryHandler<ProfitData> = (options) =>
    useQuery({
        queryKey: ["parking", "analytics"],
        queryFn: () => wrapAxios(http.get("/parking/analytics")),
        ...options,
    });
