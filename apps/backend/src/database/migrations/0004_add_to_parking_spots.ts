import { ParkingSpotV2 } from "@parking/models";
import { Migration } from "scyllo";

import { Database } from "../Database";

type MigrationType = {
    parking_spots: ParkingSpotV2;
};

export const migration_add_to_parking_spots: Migration<MigrationType> = async (database, log) => {
    await database.raw("ALTER TABLE parking_spots ADD disabled boolean");
    await database.raw("ALTER TABLE parking_spots ADD electric boolean");
    await database.raw("ALTER TABLE parking_spots ADD custom boolean");

    await database.raw("ALTER TABLE parking_spots ADD start_price_euros double");
    await database.raw("ALTER TABLE parking_spots ADD current_buy_now_price_euros double");
    await database.raw("ALTER TABLE parking_spots ADD bought_times double");
    await database.raw("ALTER TABLE parking_spots ADD current_bid double");
    await database.raw("ALTER TABLE parking_spots ADD average_buy_price double");
    await database.raw("ALTER TABLE parking_spots ADD bid_increment double");

    await database.raw("ALTER TABLE parking_spots ADD last_bid_username text");

    const parkingSpots = await Database.selectFrom("parking_spots", "*", {});

    for (const parkingSpot of parkingSpots) {
        await database.update(
            "parking_spots",
            {
                disabled: Math.random() > 0.97,
                electric: Math.random() > 0.9,
                custom: false,
                start_price_euros: 1,
                current_buy_now_price_euros: 2,
                bought_times: 0,
                current_bid: 0,
                average_buy_price: 0,
                bid_increment: 0.5,
                last_bid_username: "",
            },
            {
                id: parkingSpot.id,
            }
        );
    }

    log("Done");
};
