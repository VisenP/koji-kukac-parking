type GlobalsType = {
    mode: "development" | "production" | string;
    port: number;
    rateLimit: number;
    dbHost: string;
    dbPort: number;
    dbKeyspace: string;
    dbDatacenter: string;
    redisUrl: string;
    influxUrl: string;
    influxToken: string;
    influxOrg: string;
    influxBucket: string;
    tokenSecret: string;
};

export const Globals: GlobalsType = {
    mode: process.env.MODE ?? "development",
    port: process.env.PORT ? Number.parseInt(process.env.PORT) : 8080,
    rateLimit: process.env.RATE_LIMIT ? Number.parseInt(process.env.RATE_LIMIT) : 60,
    dbHost: process.env.DB_HOST ?? "",
    dbPort: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 9042,
    dbKeyspace: process.env.DB_KEYSPACE ?? "",
    dbDatacenter: process.env.DB_DATACENTER ?? "",
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    influxUrl: process.env.INFLUXDB_URL ?? "http://localhost:8086",
    influxToken: process.env.INFLUXDB_TOKEN ?? "devtoken",
    influxOrg: process.env.INFLUXDB_ORG ?? "parking-org",
    influxBucket: process.env.INFLUXDB_BUCKET ?? "parking",
    tokenSecret: "Change Me",
};
