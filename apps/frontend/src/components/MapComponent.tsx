import { GoogleMap, Marker, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useState } from "react";

const apiURL = "https://hackathon.kojikukac.com/";
const apiKey = "3f70fbfa-0301-484a-a4cf-4081431bcffa";

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

const initClusters = (map) => {
    const markers = [];
    const clusterOptions = {
        gridSize: 40,
        maxZoom: 20,
        styles: [
            {
                url: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m2.png",
                height: 50,
                width: 50,
            },
        ],
    };

    return new MarkerClusterer(map, markers, clusterOptions);
};

export const MyMap = () => {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: "AIzaSyCFihZ30ZpuLjeO8JOQCT4k-mnRR26hnjM",
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

    const onLoad = useCallback(
        (map) => {
            console.log("Load map: " + map);

            const bounds = new window.google.maps.LatLngBounds(center);

            //map.fitBounds(bounds);

            setMap(map);

            const markers = parkingSpots.map(
                (spot) =>
                    new window.google.maps.Marker({
                        position: { lat: spot.latitude, lng: spot.longitude },
                        // Add other marker options here
                    })
            );

            new MarkerClusterer(map, markers);
        },
        [parkingSpots]
    );

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
        >
            {parkingSpots.map((parkingSpot) => (
                <Marker
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
            ))}
        </GoogleMap>
    ) : (
        <></>
    );
};
