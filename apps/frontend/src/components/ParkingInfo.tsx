import { ParkingSpot } from "@parking/models";
import React, { useEffect, useState } from "react";

import { useReserveParkingSpot } from "../hooks/parking/useReserveParkingSpot";

const googleMapsApiKey = "AIzaSyCFihZ30ZpuLjeO8JOQCT4k-mnRR26hnjM";

type ParkingInfoProperties = {
    selectedParkingSpot: ParkingSpot;
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

export const ParkingInfo: React.FC<ParkingInfoProperties> = ({ selectedParkingSpot }) => {
    const { mutate } = useReserveParkingSpot(selectedParkingSpot.id);

    const [endH, setEndH] = useState(0);
    const [endM, setEndM] = useState(0);
    const [geoLocation, setGeoLocation] = useState(0);

    //let geoLocation = "test";

    useEffect(() => {
        getGeolocation(selectedParkingSpot.latitude, selectedParkingSpot.longitude).then((l) =>
            setGeoLocation(l)
        );
    }, [selectedParkingSpot]);

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
                <button
                    onClick={() =>
                        // TODO: Validation
                        mutate({
                            endH,
                            endM,
                        })
                    }
                >
                    Reserve
                </button>
            </div>
        </div>
    );
};
