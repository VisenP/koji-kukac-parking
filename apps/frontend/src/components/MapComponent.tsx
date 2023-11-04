import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useState } from "react";

const containerStyle = {
    width: "1000px",
    height: "1000px",
};

const center = {
    lat: -3.745,
    lng: -38.523,
};

export const MyMap = () => {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: "AIzaSyCFihZ30ZpuLjeO8JOQCT4k-mnRR26hnjM",
    });

    const [map, setMap] = useState(null);

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
            <Marker position={center} />
            <Marker
                position={{
                    lat: center.lat + 0.001,
                    lng: center.lng,
                }}
            />
            <Marker position={center} />
            <Marker position={center} />
        </GoogleMap>
    ) : (
        <></>
    );
};
