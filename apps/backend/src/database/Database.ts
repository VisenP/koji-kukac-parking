import { User } from "@parking/models";
import { Migration, ScylloClient } from "scyllo";

import { Globals } from "../globals";
import { Logger } from "../lib/logger";
import { migration_initial } from "./migrations/0001_initial";

export const Database = new ScylloClient<{
    users: User;
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

const migrations: Migration<any>[] = [migration_initial];

export const initDatabase = async () => {
    await Database.useKeyspace(Globals.dbKeyspace, true);
    await Database.migrate(migrations, true);
};
