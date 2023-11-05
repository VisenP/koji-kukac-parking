import { AdminPermissions, hasAdminPermission, ParkingSpot } from "@parking/models";
import React, { useEffect, useState } from "react";

import { http } from "../api/http";
import { useBuyParkingSpot } from "../hooks/parking/useBuyParkingSpot";
import { useParkingSpotAnalytics } from "../hooks/parking/useParkingSpot";
import { useAuthStore } from "../state/auth";

const googleMapsApiKey = "AIzaSyCFihZ30ZpuLjeO8JOQCT4k-mnRR26hnjM";

type ParkingInfoProperties = {
    selectedParkingSpot: ParkingSpot;
    onDelete?: () => void;
    onDirections?: () => void;
};

export const getGeolocation = async (lat: number, lng: number) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`;

    return await fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            return response.json();
        })
        .then((data) => {
            if (data.status === "OK") {
                return data.results[0].formatted_address;
            } else {
                console.log("Geocoding request failed");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
};

export const ParkingInfo: React.FC<ParkingInfoProperties> = ({
    selectedParkingSpot,
    onDelete,
    onDirections,
}) => {
    const { mutate } = useBuyParkingSpot(selectedParkingSpot.id);

    const [endH, setEndH] = useState(0);
    const [endM, setEndM] = useState(0);
    const [geoLocation, setGeoLocation] = useState(0);

    const [timeString, setTimeString] = useState("00:00");

    const [validTime, setValidTime] = useState(false);

    const currentHours = new Date().getMinutes() % 30;

    const currentMinutes = new Date().getSeconds();

    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const { user } = useAuthStore();

    const { data: analytics } = useParkingSpotAnalytics(selectedParkingSpot.id, {
        enabled: hasAdminPermission(user.permissions, AdminPermissions.ADMIN),
    });

    // console.log(analytics);

    const timeLeft = Math.round(
        20 - (Date.now() - Number(selectedParkingSpot.last_bid_time)) / 1000
    );

    useEffect(() => {
        getGeolocation(selectedParkingSpot.latitude, selectedParkingSpot.longitude).then((l) =>
            setGeoLocation(l)
        );
    }, [selectedParkingSpot]);

    const deleteParking = async (id: string) => {
        onDelete && onDelete();

        const response: {
            token: string;
        } = await http.delete("/parking/" + id).catch((error) => error);
    };

    useEffect(() => {
        const split = timeString.split(":");

        setEndH(Number(split[0]));
        setEndM(Number(split[1]));
        setValidTime(Number(split[0]) * 60 + Number(split[1]) >= currentTotalMinutes + 60);
    }, [timeString]);

    const showDirections = (id: string) => {
        onDirections && onDirections();
    };

    const onBid = async () => {
        if (!validTime) return;

        const error = await http
            .post("/parking/" + selectedParkingSpot.id + "/bid", {
                endH: endH,
                endM: endM,
            })
            .catch((error) => error);
    };

    const bidAmount =
        selectedParkingSpot.last_bid_time &&
        Date.now() - Number(selectedParkingSpot.last_bid_time) < 20_000
            ? selectedParkingSpot.current_bid + selectedParkingSpot.bid_increment
            : selectedParkingSpot.start_price_euros;

    return (
        <div tw={"md:h-full md:w-[25%] p-4"}>
            <span tw={"text-xl"}>Parking info</span>
            {selectedParkingSpot ? (
                <>
                    <p>
                        <b>ID: </b> {selectedParkingSpot.id.slice(0, 6)}
                    </p>
                    <p>
                        <b>Location:</b> {geoLocation}
                    </p>
                    <p>
                        <b>Zone: </b> {selectedParkingSpot.zone}
                    </p>
                    <p>
                        {!selectedParkingSpot.occupied ? (
                            <span style={{ color: "limegreen" }}>Available</span>
                        ) : selectedParkingSpot.occupied_by === user.username ? (
                            <span style={{ color: "limegreen" }}>Reserved by you</span>
                        ) : (
                            <span style={{ color: "red" }}>Not available</span>
                        )}
                    </p>
                    {analytics && (
                        <div tw={"font-bold m-2 bg-red-200 rounded-xl p-2"}>
                            <div>Daily profit: {analytics.profit1d + ""}$</div>
                            <div>Weekly profit: {analytics.profit7d + ""}$</div>
                            <div>Monthly profit: {analytics.profit30d + ""}$</div>
                        </div>
                    )}
                </>
            ) : (
                <p>Select a parking spot to view details</p>
            )}

            {!selectedParkingSpot.occupied && (
                <div tw={"flex flex-col gap-2 bg-slate-100 rounded-xl p-2"}>
                    <span tw={"text-xl"}>Register your spot!</span>
                    <div tw={"flex flex-row gap-2"}>
                        <div>End time: </div>
                        <input
                            value={timeString}
                            type={"time"}
                            onChange={(event) => setTimeString(event.target.value)}
                        ></input>
                    </div>
                    {!validTime && <span tw={"text-red-500"}>Minimum duration: 1h</span>}

                    <div tw={"flex flex-col gap-2 font-bold"}>
                        <span>
                            Buy now price: {selectedParkingSpot.current_buy_now_price_euros}$
                        </span>
                        <span>Last bidder: {selectedParkingSpot.last_bid_username}</span>
                        <span>
                            Last bid:{" "}
                            {selectedParkingSpot.last_bid_username.length > 0
                                ? selectedParkingSpot.current_bid + "$"
                                : "None"}
                        </span>
                        {selectedParkingSpot.last_bid_time &&
                            Date.now() - Number(selectedParkingSpot.last_bid_time) < 20_000 && (
                                <span tw={"flex flex-row gap-3 items-center"}>
                                    Bidding ends in: {timeLeft}s
                                    <div tw={"w-7 h-7"}>
                                        <div
                                            tw={"w-7 h-7 rounded-full"}
                                            style={{
                                                background: `conic-gradient(#3498db ${
                                                    timeLeft / 0.2
                                                }%, #ecf0f1 ${timeLeft / 0.2}% 100%)`,
                                            }}
                                        />
                                    </div>
                                </span>
                            )}
                        <span>Bid: {bidAmount}$</span>
                    </div>

                    <button onClick={onBid}>Bid {bidAmount}$</button>
                    <button
                        onClick={() =>
                            validTime &&
                            mutate({
                                endH,
                                endM,
                            })
                        }
                    >
                        Buy Now {selectedParkingSpot.current_buy_now_price_euros}$
                    </button>
                </div>
            )}

            {hasAdminPermission(user.permissions, AdminPermissions.ADMIN) && (
                <button
                    tw={
                        "inline px-[10px] py-[5px] bg-red-500 text-white border-0 rounded-md cursor-pointer hover:bg-red-700 hover:transition-all ease-linear w-[130px]"
                    }
                    onClick={() => deleteParking(selectedParkingSpot.id)}
                >
                    Delete parking
                </button>
            )}

            <button
                tw={
                    "inline ml-1 mt-4 px-[10px] py-[5px] bg-blue-500 text-white border-0 rounded-md cursor-pointer hover:bg-blue-600 hover:transition-all ease-linear w-[130px]"
                }
                onClick={() => showDirections(selectedParkingSpot.id)}
            >
                Directions
            </button>
        </div>
    );
};
