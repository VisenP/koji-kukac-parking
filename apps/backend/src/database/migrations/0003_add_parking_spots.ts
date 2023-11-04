import { ParkingSpotV1 } from "@parking/models";
import { Migration } from "scyllo";

type MigrationType = {
    parking_spots: ParkingSpotV1;
};

export const migration_add_parking_spots: Migration<MigrationType> = async (database, log) => {
    await database.createTable(
        "parking_spots",
        true,
        {
            id: {
                type: "text",
            },
            zone: {
                type: "text",
            },
            latitude: {
                type: "double",
            },
            longitude: {
                type: "double",
            },
            occupied: {
                type: "boolean",
            },
        },
        "id"
    );

    await database.createIndex("parking_spots", "parking_spots_by_zone", "zone");
    await database.createIndex("parking_spots", "parking_spots_by_occupied_status", "occupied");

    log("Done");
};
