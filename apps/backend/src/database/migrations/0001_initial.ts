import { UserV1 } from "@kontestis/models";
import { Migration } from "scyllo";

type InitialDB = {
    users: UserV1;
};

export const migration_initial: Migration<InitialDB> = async (database, log) => {
    await database.createTable(
        "users",
        true,
        {
            id: { type: "bigint" },
            username: { type: "text" },
            password: { type: "text " },
            email: { type: "text" },
            permissions: { type: "bigint" },
        },
        "id"
    );
    log("Done");
};
