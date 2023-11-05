import { ParkingSpot } from "@parking/models";
import {
    DirectionsService,
    GoogleMap,
    Marker,
    MarkerClusterer,
    useJsApiLoader,
} from "@react-google-maps/api";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";

import { useAuthStore } from "../state/auth";
import { ParkingInfo } from "./ParkingInfo";

const googleMapsApiKey = "AIzaSyCFihZ30ZpuLjeO8JOQCT4k-mnRR26hnjM";

const containerStyle = {
    width: "100vw",
    height: "94vh",
};

const center = {
    lat: 45.814_44,
    lng: 15.977_98,
};

const destination = {
    lat: 34.0522, // Latitude of your destination
    lng: -118.2437, // Longitude of your destination
};

type Parameters = {
    data: ParkingSpot[];
    special?: ParkingSpot;
    onSelectLatLng?: (lat: number, lng: number) => void;
    closestSpotLatitude?: number;
    closestSpotLongitude?: number;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const MyMap: FC<Parameters> = ({
    data,
    special,
    onSelectLatLng,
    closestSpotLatitude,
    closestSpotLongitude,
    // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: googleMapsApiKey,
    });

    const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

    const { user } = useAuthStore();

    /*
    const { data: selectedSpot } = useParkingSpot(selectedSpotId ?? "", {
        enabled: !!selectedSpotId,
    });*/

    const selectedSpot = useMemo(() => {
        return data.filter((element) => element.id === selectedSpotId).pop();
    }, [data, selectedSpotId]);

    const [map, setMap] = useState(null);
    const [currentLatitude, setCurrentLatitude] = useState(0);
    const [currentLongitude, setCurrentLongitude] = useState(0);

    const [markedLatitude, setMarkedLatitude] = useState(0);
    const [markedLongitude, setMarkedLongitude] = useState(0);

    const [directionsShow, setDirectionsShow] = useState(false);

    const onLoad = useCallback((map) => {
        map.addListener("click", (mapsMouseEvent) => {
            if (onSelectLatLng) {
                onSelectLatLng(mapsMouseEvent.latLng.lat(), mapsMouseEvent.latLng.lng());
                setMarkedLatitude(mapsMouseEvent.latLng.lat());
                setMarkedLongitude(mapsMouseEvent.latLng.lng());
            }
        });

        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

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

    return isLoaded ? (
        <div tw={"flex h-full"}>
            {selectedSpot && (
                <ParkingInfo
                    onDelete={() => {
                        // eslint-ignore-next-line
                        setSelectedSpotId(null);
                    }}
                    onDirections={() => setDirectionsShow(true)}
                    selectedParkingSpot={selectedSpot}
                />
            )}
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                {
                    //<Marker position={{ lat: currentLatitude, lng: currentLongitude }} />
                }
                <Marker
                    position={{ lat: closestSpotLatitude ?? 0, lng: closestSpotLongitude ?? 0 }}
                    icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        fillColor: "yellow",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "white",
                        scale: 7,
                    }}
                />
                <Marker
                    position={{ lat: markedLatitude, lng: markedLongitude }}
                    icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        fillColor: "blue",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "white",
                        scale: 7,
                    }}
                />{" "}
                {map && (
                    <MarkerClusterer
                        options={{
                            imagePath:
                                "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
                        }}
                    >
                        {(clusterer) =>
                            data
                                .filter((de) => de.latitude && de.longitude)
                                .map((parkingSpot) => (
                                    <Marker
                                        clusterer={clusterer}
                                        icon={
                                            parkingSpot.id !== special?.id
                                                ? parkingSpot.occupied
                                                    ? {
                                                          path: window.google.maps.SymbolPath
                                                              .CIRCLE,
                                                          scale: 10,

                                                          fillColor:
                                                              parkingSpot.occupied_by !==
                                                              user.username
                                                                  ? "red"
                                                                  : "blue",
                                                          fillOpacity: 1,
                                                          strokeWeight: 2,
                                                          strokeColor: "white",
                                                      }
                                                    : {
                                                          path: window.google.maps.SymbolPath
                                                              .CIRCLE,
                                                          scale: 10,
                                                          fillColor: "green",
                                                          fillOpacity: 1,
                                                          strokeWeight: 2,
                                                          strokeColor: "white",
                                                      }
                                                : {
                                                      path: window.google.maps.SymbolPath.CIRCLE,
                                                      scale: 8,
                                                      fillColor: "orangered",
                                                      fillOpacity: 1,
                                                      strokeColor: "orangered",
                                                      strokeWeight: 1,
                                                  }
                                        }
                                        key={parkingSpot.id}
                                        onClick={() => {
                                            setSelectedSpotId(parkingSpot.id);
                                            setDirectionsShow(false);
                                        }}
                                        position={{
                                            lat: parkingSpot.latitude,
                                            lng: parkingSpot.longitude,
                                        }}
                                    />
                                )) as unknown as JSX.Element
                        }
                    </MarkerClusterer>
                )}
                {directionsShow ? (
                    <DirectionsService
                        options={{
                            destination: {
                                lat: selectedSpot?.latitude ?? 0,
                                lng: selectedSpot?.longitude ?? 0,
                            },
                            origin: { lat: currentLatitude, lng: currentLongitude },
                            travelMode: "DRIVING",
                        }}
                        callback={(response) => {
                            if (response !== null) {
                                if (response.status === "OK") {
                                    const directionsRenderer =
                                        new window.google.maps.DirectionsRenderer({
                                            directions: response,
                                            map: map,
                                            preserveViewport: true,
                                        });
                                } else {
                                    console.error(
                                        "Directions request failed with status:",
                                        response.status
                                    );
                                }
                            }
                        }}
                    />
                ) : (
                    ""
                )}
            </GoogleMap>
        </div>
    ) : (
        <></>
    );
};
