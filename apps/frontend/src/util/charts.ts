import { StatisticRange } from "../hooks/stats/types";

type ChartDateFormatFunction = (date: Date, index: number) => string;

const splitAndIndex = (source: string, index: number, spliterator: string = ",") =>
    source.split(spliterator)[index];

export const RangeFormatters: Record<StatisticRange, ChartDateFormatFunction> = {
    "24h": (date) => `${date.getHours()}:00`,
    "7d": (date, _) => splitAndIndex("7", date.getDay()),
    "30d": (date, _) => `${date.getDate() + 1}. ${splitAndIndex("30", date.getMonth())}`,
    "1y": (date, _) => `${splitAndIndex("1y", date.getMonth())} ${date.getFullYear()}.`,
};
