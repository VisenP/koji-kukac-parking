import { AdminPermissions, hasAdminPermission } from "@parking/models";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { MyMap } from "../components/MapComponent";
import { useAllParkingSpots } from "../hooks/parking/useAllParkingSpots";
import { useAuthStore } from "../state/auth";
import { useTokenStore } from "../state/token";

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const earthRadius = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in kilometers
    return earthRadius * c;
}

export const MapPage = () => {
    const { data: spots } = useAllParkingSpots({
        refetchInterval: 1000,
    });

    const navigate = useNavigate();

    const { user } = useAuthStore();

    const { setToken } = useTokenStore();

    const [selectedZone, setSelectedZone] = useState("All");

    const [electricOnly, setElectricOnly] = useState(false);
    const [disabledOnly, setDisabledOnly] = useState(false);
    const [activeOnly, setActiveOnly] = useState(false);
    const [reservedOnly, setReservedOnly] = useState(false);
    const [freeOnly, setFreeOnly] = useState(false);

    // eslint-disable-next-line sonarjs/cognitive-complexity
    const filteredSpots = useMemo(() => {
        if (!spots) return;

        return spots.filter((spot) => {
            if (reservedOnly && spot.occupied_by !== user.username) return false;

            if (selectedZone !== "All" && selectedZone !== spot.zone) return false;

            if (electricOnly && !spot.electric) return false;

            if (disabledOnly && !spot.disabled) return false;

            if (freeOnly && spot.current_buy_now_price_euros > 0) return false;

            return !(activeOnly && spot.occupied);
        });
    }, [spots, selectedZone, activeOnly, reservedOnly, electricOnly, disabledOnly, freeOnly]);

    const zones = ["All", "Zone1", "Zone2", "Zone3", "Zone4"];

    const [currentLatitude, setCurrentLatitude] = useState(0);
    const [currentLongitude, setCurrentLongitude] = useState(0);

    const [closestSpotLatitude, setClosestSpotLatitude] = useState(0);
    const [closestSpotLongitude, setClosestSpotLongitude] = useState(0);

    const closestSpot = () => {
        let closestDistance = Number.POSITIVE_INFINITY;
        let closestCoordinate = null;

        if (filteredSpots) {
            for (const filteredSpot of filteredSpots) {
                const distance = calculateDistance(
                    currentLatitude,
                    currentLongitude,
                    filteredSpot.latitude,
                    filteredSpot.longitude
                );

                if (distance < closestDistance && !filteredSpot.occupied) {
                    closestDistance = distance;
                    closestCoordinate = filteredSpot;
                }
            }
        }

        if (closestCoordinate) {
            setClosestSpotLatitude(closestCoordinate.latitude);
            setClosestSpotLongitude(closestCoordinate.longitude);
        }
    };

    const occupiedPercentage = useMemo(() => {
        return (
            (filteredSpots?.filter((spot) => spot.occupied)?.length ?? 0) /
            (filteredSpots?.length ?? 1)
        );
    }, [filteredSpots]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCurrentLatitude(position.coords.latitude);
                setCurrentLongitude(position.coords.longitude);
            });
        } else {
            console.error("Geolocation is not supported by your browser.");
        }
    }, []);

    return (
        <div tw={"flex md:flex-col"}>
            <div tw={"h-[6vh] p-2 shadow-2xl"}>
                <div tw={"flex w-full flex-col md:flex-row gap-2 justify-between items-center"}>
                    <div tw={"flex flex-col md:flex-row gap-2"}>
                        {zones.map((zone) => {
                            return (
                                <button
                                    key={zone}
                                    onClick={() => setSelectedZone(zone)}
                                    tw={
                                        "inline px-[10px] py-[7px] bg-gray-500 text-white border-0 rounded-md cursor-pointer hover:bg-gray-600 hover:transition-all ease-linear"
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
                            onClick={() => setElectricOnly(!electricOnly)}
                            tw={
                                "inline px-[10px] py-[5px] bg-gray-500 text-white border-0 rounded-md cursor-pointer hover:bg-gray-600 hover:transition-all ease-linear"
                            }
                            style={{
                                backgroundColor: electricOnly ? "green" : "",
                            }}
                        >
                            Show electric
                        </button>
                        <button
                            onClick={() => setDisabledOnly(!disabledOnly)}
                            tw={
                                "inline px-[10px] py-[5px] bg-gray-500 text-white border-0 rounded-md cursor-pointer hover:bg-gray-600 hover:transition-all ease-linear"
                            }
                            style={{
                                backgroundColor: disabledOnly ? "green" : "",
                            }}
                        >
                            Show disabled
                        </button>
                        <button
                            onClick={() => setActiveOnly(!activeOnly)}
                            tw={
                                "inline px-[10px] py-[5px] bg-gray-500 text-white border-0 rounded-md cursor-pointer hover:bg-gray-600 hover:transition-all ease-linear"
                            }
                            style={{
                                backgroundColor: activeOnly ? "green" : "",
                            }}
                        >
                            Show available
                        </button>
                        <button
                            onClick={() => setFreeOnly(!freeOnly)}
                            tw={
                                "inline px-[10px] py-[5px] bg-gray-500 text-white border-0 rounded-md cursor-pointer hover:bg-gray-600 hover:transition-all ease-linear"
                            }
                            style={{
                                backgroundColor: freeOnly ? "green" : "",
                            }}
                        >
                            Show free
                        </button>
                        <button
                            onClick={() => setReservedOnly(!reservedOnly)}
                            tw={
                                "inline px-[10px] py-[5px] bg-gray-500 text-white border-0 rounded-md cursor-pointer hover:bg-gray-600 hover:transition-all ease-linear"
                            }
                            style={{
                                backgroundColor: reservedOnly ? "green" : "",
                            }}
                        >
                            Show reserved
                        </button>
                        <button
                            onClick={() => closestSpot()}
                            tw={
                                "inline px-[10px] py-[5px] bg-blue-500 text-white border-0 rounded-md cursor-pointer hover:bg-blue-600 hover:transition-all ease-linear"
                            }
                        >
                            Mark closest
                        </button>
                    </div>
                    <span tw={"font-bold"}>
                        {occupiedPercentage <= 0.3
                            ? "Low traffic"
                            : occupiedPercentage <= 0.65
                            ? "Medium traffic"
                            : occupiedPercentage <= 0.8
                            ? "High traffic"
                            : "Very high traffic"}{" "}
                        ({Math.round(occupiedPercentage * 100)}% of all parkings are occupied)
                    </span>
                    <div tw={"flex flex-row gap-2"}>
                        {hasAdminPermission(user.permissions, AdminPermissions.ADMIN) && (
                            <button
                                tw={
                                    "inline px-[10px] py-[5px] bg-amber-500 text-white border-0 rounded-md cursor-pointer hover:bg-amber-700 hover:transition-all ease-linear"
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
                            onClick={() => {
                                setToken("");
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            <div>
                {filteredSpots && (
                    <MyMap
                        data={filteredSpots}
                        closestSpotLatitude={closestSpotLatitude}
                        closestSpotLongitude={closestSpotLongitude}
                    />
                )}
            </div>
        </div>
    );
};
