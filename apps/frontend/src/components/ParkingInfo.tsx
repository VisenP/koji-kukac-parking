import { ParkingSpot } from "@parking/models";
import React, { useState } from "react";

import { useReserveParkingSpot } from "../hooks/parking/useReserveParkingSpot";

type ParkingInfoProperties = {
    selectedParkingSpot: ParkingSpot;
};

export const ParkingInfo: React.FC<ParkingInfoProperties> = ({ selectedParkingSpot }) => {
    const { mutate } = useReserveParkingSpot(selectedParkingSpot.id);

    const [endH, setEndH] = useState(0);
    const [endM, setEndM] = useState(0);

    return (
        <div tw={"h-full w-[25%] p-4"}>
            <span tw={"text-xl"}>Parking info</span>
            {selectedParkingSpot ? (
                <>
                    <p>
                        <b>ID: </b> {selectedParkingSpot.id}
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
            <div tw={"flex flex-col"}>
                <span tw={"text-xl"}>Register your spot!</span>
                <input
                    value={endH}
                    type={"number"}
                    onChange={(event) => setEndH(Number(event.target.value))}
                ></input>
                <input
                    value={endM}
                    type={"number"}
                    onChange={(event) => setEndM(Number(event.target.value))}
                ></input>
                <button
                    onClick={() =>
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
