export type ParkingSpotV1 = {
    id: string;
    zone: string;
    longitude: number;
    latitude: number;
    occupied: boolean;
};

export type ParkingSpot = ParkingSpotV1;
