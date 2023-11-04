import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useState } from "react";

const apiURL = "https://hackathon.kojikukac.com/";
const apiKey = "3f70fbfa-0301-484a-a4cf-4081431bcffa";

const containerStyle = {
    width: "1000px",
    height: "1000px",
};

const center = {
    lat: -3.745,
    lng: -38.523,
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

    const onLoad = useCallback((map) => {
        console.log("Load map: " + map);

        // This is just an example of getting and using the map instance!!! don't just blindly copy!
        const bounds = new window.google.maps.LatLngBounds(center);

        map.fitBounds(bounds);

        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
        >
            {parkingSpots.map((parkingSpot) => (
                <Marker
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
