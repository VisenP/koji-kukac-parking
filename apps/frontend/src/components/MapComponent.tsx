import { GoogleMap, Marker, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useState } from "react";

const apiURL = "https://hackathon.kojikukac.com/";
const apiKey = "3f70fbfa-0301-484a-a4cf-4081431bcffa";

const googleMapsApiKey = "AIzaSyCFihZ30ZpuLjeO8JOQCT4k-mnRR26hnjM";

const containerStyle = {
    width: "100vw",
    height: "100vh",
};

const center = {
    lat: 45.814_44,
    lng: 15.977_98,
};

type ParkingSpot = {
    id: string;
    latitude: number;
    longitude: number;
    occupied: boolean;
    parkingSpotZone: string;
};

export const MyMap = () => {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: googleMapsApiKey,
    });

    const [map, setMap] = useState(null);
    const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);

    useEffect(() => {
        fetch(apiURL + "api/ParkingSpot/getAll", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Api-Key": apiKey,
            },
        }).then((response) => {
            if (response.ok) {
                response.json().then((data) => setParkingSpots(data));
            }
        });
    }, []);

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // @ts-ignore
    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
        >
            {map && (
                <MarkerClusterer
                    options={{
                        imagePath:
                            "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
                    }}
                >
                    {(clusterer) =>
                        parkingSpots.map((parkingSpot) => (
                            <Marker
                                clusterer={clusterer}
                                icon={
                                    parkingSpot.occupied
                                        ? {
                                              path: window.google.maps.SymbolPath.CIRCLE,
                                              scale: 10,
                                              fillColor: "red",
                                              fillOpacity: 1,
                                              strokeColor: "red",
                                              strokeWeight: 1,
                                          }
                                        : {
                                              path: window.google.maps.SymbolPath.CIRCLE,
                                              scale: 10,
                                              fillColor: "green",
                                              fillOpacity: 1,
                                              strokeColor: "green",
                                              strokeWeight: 1,
                                          }
                                }
                                key={parkingSpot.id}
                                position={{
                                    lat: parkingSpot.latitude,
                                    lng: parkingSpot.longitude,
                                }}
                            />
                        )) as unknown as JSX.Element
                    }
                </MarkerClusterer>
            )}
        </GoogleMap>
    ) : (
        <></>
    );
};
