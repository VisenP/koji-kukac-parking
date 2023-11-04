import { AdminPermissions, hasAdminPermission } from "@parking/models";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { MyMap } from "../components/MapComponent";
import { useAllParkingSpots } from "../hooks/parking/useAllParkingSpots";
import { useAuthStore } from "../state/auth";
import { useTokenStore } from "../state/token";

const apiURL = "https://hackathon.kojikukac.com/";
const apiKey = "3f70fbfa-0301-484a-a4cf-4081431bcffa";

export const MapPage = () => {
    const { data: spots, error } = useAllParkingSpots({
        refetchInterval: 1000,
    });

    const navigate = useNavigate();

    const { user } = useAuthStore();

    const { setToken } = useTokenStore();

    const [selectedZone, setSelectedZone] = useState("All");

    const [activeOnly, setActiveOnly] = useState(false);

    const filteredSpots = useMemo(() => {
        if (!spots) return;

        return spots.filter((spot) => {
            if (selectedZone !== "All" && selectedZone !== spot.zone) return false;

            return !(activeOnly && spot.occupied);
        });
    }, [spots, selectedZone, activeOnly]);

    const zones = ["All", "Zone1", "Zone2", "Zone3", "Zone4"];

    return (
        <div tw={"flex flex-col"}>
            <div tw={"h-10 p-2"}>
                <div tw={"flex w-full flex-row gap-2 justify-between items-center"}>
                    <div tw={"flex flex-row gap-2"}>
                        {zones.map((zone) => {
                            return (
                                <button
                                    key={zone}
                                    onClick={() => setSelectedZone(zone)}
                                    tw={
                                        "inline px-[10px] py-[5px] bg-gray-500 text-white border-0 rounded-md cursor-pointer hover:bg-gray-600 hover:transition-all ease-linear"
                                    }
                                    style={{
                                        backgroundColor: zone === selectedZone ? "green" : "",
                                    }}
                                >
                                    {zone}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setActiveOnly(!activeOnly)}
                            tw={
                                "inline px-[10px] py-[5px] bg-gray-500 text-white border-0 rounded-md cursor-pointer hover:bg-gray-600 hover:transition-all ease-linear"
                            }
                            style={{
                                backgroundColor: activeOnly ? "green" : "",
                            }}
                        >
                            Show Active
                        </button>
                    </div>
                    <div tw={"flex flex-row gap-2"}>
                        {hasAdminPermission(user.permissions, AdminPermissions.ADMIN) && (
                            <button
                                tw={
                                    "inline px-[10px] py-[5px] bg-amber-500 text-white border-0 rounded-md cursor-pointer hover:bg-red-700 hover:transition-all ease-linear"
                                }
                                onClick={() => navigate("admin")}
                            >
                                Admin
                            </button>
                        )}
                        <button
                            tw={
                                "inline px-[10px] py-[5px] bg-red-500 text-white border-0 rounded-md cursor-pointer hover:bg-red-700 hover:transition-all ease-linear"
                            }
                            onClick={() => setToken("")}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            <div>{filteredSpots && <MyMap data={filteredSpots} />}</div>
        </div>
    );
};
