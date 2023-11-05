import { ParkingSpot, User } from "@parking/models";
import { Migration, ScylloClient } from "scyllo";

import { Globals } from "../globals";
import { Logger } from "../lib/logger";
import { migration_initial } from "./migrations/0001_initial";
import { migration_add_user_index } from "./migrations/0002_add_user_index";
import { migration_add_parking_spots } from "./migrations/0003_add_parking_spots";
import { migration_add_to_parking_spots } from "./migrations/0004_add_to_parking_spots";
import { migration_add_last_bid_and_user } from "./migrations/0005_add_last_bid_and_user";

export const Database = new ScylloClient<{
    users: User;
    parking_spots: ParkingSpot;
}>({
    client: {
        contactPoints: [Globals.dbHost + ":" + Globals.dbPort],
        keyspace: "system",
        localDataCenter: Globals.dbDatacenter,
        encoding: {
            useBigIntAsLong: true,
        },
    },
    log: Logger.database,
});

const migrations: Migration<any>[] = [
    migration_initial,
    migration_add_user_index,
    migration_add_parking_spots,
    migration_add_to_parking_spots,
    migration_add_last_bid_and_user,
];

export const initDatabase = async () => {
    await Database.useKeyspace(Globals.dbKeyspace, true);
    await Database.migrate(migrations, true);
};
