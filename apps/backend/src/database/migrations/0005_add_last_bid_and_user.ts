import { ParkingSpotV3 } from "@parking/models";
import { Migration } from "scyllo";

import { Database } from "../Database";

type MigrationType = {
    parking_spots: ParkingSpotV3;
};

export const migration_add_last_bid_and_user: Migration<MigrationType> = async (database, log) => {
    await database.raw("ALTER TABLE parking_spots ADD occupied_by text");
    await database.raw("ALTER TABLE parking_spots ADD last_bid_time bigint");

    const parkingSpots = await Database.selectFrom("parking_spots", "*", {});

    for (const parkingSpot of parkingSpots) {
        await database.update(
            "parking_spots",
            {
                occupied_by: "Unknown",
                last_bid_time: BigInt(Date.now()),
            },
            {
                id: parkingSpot.id,
            }
        );
    }

    log("Done");
};
