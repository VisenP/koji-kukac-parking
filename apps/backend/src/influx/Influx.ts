import { Globals } from "../globals";
import { createInfluxClient, InfluxUInteger } from "./InfluxClient";

// schema here could be improved, but it would require some changes to the client
//  and we kind of don't have time for that, it is good enough for now
export const Influx = createInfluxClient<{
    profit: {
        values: {
            amount: InfluxUInteger;
        };
        tags: ["spotId"];
    };
    occupied: {
        values: {
            // no real meaning, but this has to exist
            wasOccupied: boolean;
        };
        tags: ["spotId"];
    };
}>({
    url: Globals.influxUrl,
    token: Globals.influxToken,
    org: Globals.influxOrg,
    bucket: Globals.influxBucket,
});

export const initInflux = () => Promise.resolve();
