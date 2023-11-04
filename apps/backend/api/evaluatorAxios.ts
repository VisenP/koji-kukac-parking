import axios from "axios";

export const parkingAxios = axios.create({
    timeout: 60_000,
});

parkingAxios.interceptors.request.use(async (config) => {
    config.headers.set("Api-Key", "3f70fbfa-0301-484a-a4cf-4081431bcffa");

    return config;
});
