import { ParkingSpot } from "@parking/models";
import { GoogleMap, Marker, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import React, { FC, useCallback, useState } from "react";

import { ParkingInfo } from "./ParkingInfo";

const googleMapsApiKey = "AIzaSyCFihZ30ZpuLjeO8JOQCT4k-mnRR26hnjM";

const containerStyle = {
    width: "100vw",
    height: "95vh",
};

const center = {
    lat: 45.814_44,
    lng: 15.977_98,
};

type Parameters = {
    data: ParkingSpot[];
    special?: ParkingSpot;
    onSelectLatLng?: (lat: number, lng: number) => void;
};

export const MyMap: FC<Parameters> = ({ data, special, onSelectLatLng }) => {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: googleMapsApiKey,
    });

    const [selectedSpot, setSelectedSpot] = useState<ParkingSpot>();

    const [map, setMap] = useState(null);

    const onLoad = useCallback((map) => {
        map.addListener("click", (mapsMouseEvent) => {
            if (onSelectLatLng)
                onSelectLatLng(mapsMouseEvent.latLng.lat(), mapsMouseEvent.latLng.lng());
        });

        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    return isLoaded ? (
        <div tw={"flex"}>
            {selectedSpot && <ParkingInfo selectedParkingSpot={selectedSpot} />}
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
                            // TODO: Fix
                            (special ? [...data, special] : data).map((parkingSpot) => (
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
                                    onClick={() => setSelectedSpot(parkingSpot)}
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
        </div>
    ) : (
        <></>
    );
};
