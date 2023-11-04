import { ParkingSpot } from "@parking/models";
import { GoogleMap, Marker, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import { FC, useCallback, useState } from "react";

const googleMapsApiKey = "AIzaSyCFihZ30ZpuLjeO8JOQCT4k-mnRR26hnjM";

const containerStyle = {
    width: "100vw",
    height: "100vh",
};

const center = {
    lat: 45.814_44,
    lng: 15.977_98,
};

type Parameters = {
    data: ParkingSpot[];
};

export const MyMap: FC<Parameters> = ({ data }) => {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: googleMapsApiKey,
    });

    const [map, setMap] = useState(null);

    //  const { data: spots, error } = useAllParkingSpots();

    // useInterval(() => {}, 5000);

    // console.log(spots);
    console.log("Data: " + data.length);

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

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
            {map && (
                <MarkerClusterer
                    options={{
                        imagePath:
                            "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
                    }}
                >
                    {(clusterer) =>
                        data.map((parkingSpot) => (
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
