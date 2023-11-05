import { AdminPermissions, hasAdminPermission, ParkingSpot } from "@parking/models";
import React, { useEffect, useState } from "react";

import { http } from "../api/http";
import { useBuyParkingSpot } from "../hooks/parking/useBuyParkingSpot";
import { useAuthStore } from "../state/auth";

const googleMapsApiKey = "AIzaSyCFihZ30ZpuLjeO8JOQCT4k-mnRR26hnjM";

type ParkingInfoProperties = {
    selectedParkingSpot: ParkingSpot;
    onDelete?: () => void;
    onDirections?: () => void;
};

const getGeolocation = async (lat: number, lng: number) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`;

    console.log(url);

    return await fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            return response.json();
        })
        .then((data) => {
            if (data.status === "OK") {
                const result = data.results[0].formatted_address;

                console.log(result);

                return result;
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

    const { user } = useAuthStore();

    useEffect(() => {
        getGeolocation(selectedParkingSpot.latitude, selectedParkingSpot.longitude).then((l) =>
            setGeoLocation(l)
        );
    }, [selectedParkingSpot]);

    const deleteParking = async (id: string) => {
        console.log("Deleting:", id);

        onDelete && onDelete();

        const response: {
            token: string;
        } = await http.delete("/parking/" + id).catch((error) => error);
    };

    const showDirections = (id: string) => {
        onDirections && onDirections();

        console.log("Show directions:", id);
    };

    const onBid = async () => {
        const error = await http
            .post("/parking/" + selectedParkingSpot.id + "/bid")
            .catch((error) => error);

        console.log(error);
    };

    return (
        <div tw={"h-full w-[25%] p-4"}>
            <span tw={"text-xl"}>Parking info</span>
            {selectedParkingSpot ? (
                <>
                    <p>
                        <b>ID: </b> {selectedParkingSpot.id}
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
                        ) : (
                            <span style={{ color: "red" }}>Not available</span>
                        )}
                    </p>
                </>
            ) : (
                <p>Select a parking spot to view details</p>
            )}

            {!selectedParkingSpot.occupied && (
                <div tw={"flex flex-col gap-2 bg-slate-100 rounded-xl p-2"}>
                    <span tw={"text-xl"}>Register your spot!</span>
                    <div tw={"flex flex-row gap-2"}>
                        <div>End hour: </div>
                        <input
                            value={endH}
                            type={"number"}
                            onChange={(event) => setEndH(Number(event.target.value))}
                        ></input>
                    </div>
                    <div tw={"flex flex-row gap-2"}>
                        <span>End min:</span>
                        <input
                            value={endM}
                            type={"number"}
                            onChange={(event) => setEndM(Number(event.target.value))}
                        ></input>
                    </div>

                    <div>
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
                                    <span>
                                        Bidding ends in:{" "}
                                        {Math.round(
                                            20 -
                                                (Date.now() -
                                                    Number(selectedParkingSpot.last_bid_time)) /
                                                    1000
                                        )}
                                        s
                                    </span>
                                )}
                            <span>
                                Bid:{" "}
                                {(selectedParkingSpot.last_bid_username.length > 0
                                    ? selectedParkingSpot.current_bid
                                    : selectedParkingSpot.start_price_euros) +
                                    selectedParkingSpot.bid_increment}
                                $
                            </span>
                        </div>
                    </div>

                    <button onClick={onBid}>Bid</button>
                    <button
                        onClick={() =>
                            // TODO: Validation
                            mutate({
                                endH,
                                endM,
                            })
                        }
                    >
                        Buy Now
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
