import { Static } from "@sinclair/typebox";

import { AllowedCountWindows, InfluxAggregateNumberResult } from "../influx/InfluxClient";
import { RangeQueryUnion } from "../routes/stats/schemas";

type Range = Static<typeof RangeQueryUnion>;

export const getWindowFromRange = (range: Range): AllowedCountWindows =>
    range === "24h" ? "1h" : ["7d", "30d"].includes(range) ? "1d" : "1mo";

const rangeItemLengthMap: Record<Range, number> = {
    "24h": 24,
    "7d": 7,
    "30d": 30,
    "1y": 12,
};

// very simple, if empty, give array where count = 0
//  influx will usually handle all the sorting and making the array nice
//  unless there is no data at all, it then returns nothing
export const fillIfEmpty = <K extends string>(
    source: InfluxAggregateNumberResult<K>,
    key: K,
    range: Range,
    alternateSize?: number
): InfluxAggregateNumberResult<K> => {
    if (source.length > 0) return source.slice(0, alternateSize ?? rangeItemLengthMap[range]);

    const now = new Date();

    switch (range) {
        case "24h":
            return Array.from({ length: alternateSize ?? 24 }, (_, index) => ({
                time: new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    now.getHours() - index
                ),
                [key]: 0,
            })) as InfluxAggregateNumberResult<K>;
        case "7d":
        case "30d":
            return Array.from(
                { length: alternateSize ?? (range === "7d" ? 7 : 30) },
                (_, index) => ({
                    time: new Date(now.getFullYear(), now.getMonth(), now.getDate() - index),
                    [key]: 0,
                })
            ) as InfluxAggregateNumberResult<K>;
        case "1y":
            return Array.from({ length: alternateSize ?? 12 }, (_, index) => ({
                time: new Date(now.getFullYear(), now.getMonth() - index),
                [key]: 0,
            })) as InfluxAggregateNumberResult<K>;
    }
};
