import React, { FC, useState } from "react";

import { http } from "../../api/http";
import { MyMap } from "../../components/MapComponent";
import { useAllParkingSpots } from "../../hooks/parking/useAllParkingSpots";

export const AdminPage: FC = () => {
    const { data: spots, error } = useAllParkingSpots({
        refetchInterval: 1000,
    });

    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);
    const [zone, setZone] = useState("Zone1");
    const [startPrice, setStartPrice] = useState(1);
    const [bidIncrement, setBidIncrement] = useState(0.5);
    const [disabled, setDisabled] = useState(false);
    const [electric, setElectric] = useState(false);

    const zones = ["Zone1", "Zone2", "Zone3", "Zone4"];

    const onSubmit = async () => {
        const response: {
            token: string;
        } = await http
            .post("/parking", {
                zone: zone,
                latitude: lat,
                longitude: lng,
                occupied: false,
                start_price_euros: startPrice,
                bin_increment: bidIncrement,
                disabled: disabled,
                electric: electric,
            })
            .then((r) => r.data.data);

        console.log(response);
    };

    return (
        <div tw={"grid grid-cols-4 flex-row"}>
            <div tw={"w-full p-4"}>
                <form>
                    <div tw={"mb-4 flex flex-col gap-2"}>
                        <span>Zone:</span>
                        <select
                            name="zones"
                            id="zones"
                            value={zone}
                            onChange={(event) => setZone(event.target.value)}
                            tw={"border-2 border-solid border-neutral-200 rounded-lg p-2"}
                        >
                            {zones.map((element) => (
                                <option key={element} value={element}>
                                    {element}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div tw={"flex flex-col m-2 gap-2"}>
                        <span>Latitude:</span>
                        <input
                            type={"number"}
                            onChange={(event) => setLat(Number(event.target.value))}
                            value={Math.round(lat * 100_000) / 100_000}
                            tw={"border-2 border-solid border-neutral-200 rounded-lg p-2"}
                        />

                        <span>Longitude:</span>
                        <input
                            type={"number"}
                            onChange={(event) => setLng(Number(event.target.value))}
                            value={Math.round(lng * 100_000) / 100_000}
                            tw={"border-2 border-solid border-neutral-200 rounded-lg p-2"}
                        />

                        <span>Start price:</span>
                        <input
                            type={"number"}
                            onChange={(event) => setStartPrice(Number(event.target.value))}
                            value={startPrice}
                            tw={"border-2 border-solid border-neutral-200 rounded-lg p-2"}
                        />

                        <span>Bid increment:</span>
                        <input
                            type={"number"}
                            onChange={(event) => setBidIncrement(Number(event.target.value))}
                            value={bidIncrement}
                            tw={"border-2 border-solid border-neutral-200 rounded-lg p-2"}
                        />
                        <div tw={"flex flex-row gap-2"}>
                            <span tw={"flex items-center"}>
                                Disabled:
                                <input
                                    type={"checkbox"}
                                    title={"Disabled"}
                                    onChange={() => setDisabled(!disabled)}
                                    checked={disabled}
                                    tw={"border-2 border-solid border-neutral-200 rounded-lg p-2"}
                                />
                            </span>
                            <span tw={"flex items-center"}>
                                Electric:
                                <input
                                    type={"checkbox"}
                                    title={"Electric"}
                                    onChange={() => setElectric(!electric)}
                                    checked={electric}
                                    tw={"border-2 border-solid border-neutral-200 rounded-lg p-2"}
                                />
                            </span>
                        </div>
                    </div>
                </form>
                <button
                    tw={
                        "inline px-[10px] py-[5px] bg-gray-500 text-white border-0 rounded-md cursor-pointer hover:bg-gray-600 hover:transition-all ease-linear"
                    }
                    onClick={onSubmit}
                >
                    Add parking
                </button>
            </div>
            {spots && (
                <div tw={"col-span-3"}>
                    <MyMap
                        onSelectLatLng={(a, b) => {
                            setLat(a);
                            setLng(b);
                        }}
                        data={spots}
                    />
                </div>
            )}
        </div>
    );
};
