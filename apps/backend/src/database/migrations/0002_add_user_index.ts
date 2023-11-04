import { UserV1 } from "@parking/models";
import { Migration } from "scyllo";

import { Database } from "../Database";

type MigrationType = {
    users: UserV1;
};

export const migration_add_user_index: Migration<MigrationType> = async (database, log) => {
    await Database.createIndex("users", "users_by_email", "email");
    await Database.createIndex("users", "users_by_username", "username");

    log("Done");
};
