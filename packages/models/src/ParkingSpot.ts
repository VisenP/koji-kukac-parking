export type ParkingSpotV1 = {
    id: string;
    zone: string;
    longitude: number;
    latitude: number;
    occupied: boolean;
};

export type ParkingSpotV2 = ParkingSpotV1 & {
    disabled: boolean;
    electric: boolean;
    custom: boolean;
    start_price_euros: number;
    current_buy_now_price_euros: number;
    last_bid_username: string;
    current_bid: number;
    bought_times: number;
    average_buy_price: number;
    bid_increment: number;
};

export type ParkingSpotV3 = ParkingSpotV2 & {
    last_bid_time: bigint;
    occupied_by: string;
};

export type ParkingSpot = ParkingSpotV3;

export type ParkingSpotWithProfit = ParkingSpot & {
    profit1d: number;
    profit7d: number;
    profit30d: number;
};
