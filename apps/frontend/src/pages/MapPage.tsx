import { MyMap } from "../components/MapComponent";
import { useAllParkingSpots } from "../hooks/parking/useAllParkingSpots";

const apiURL = "https://hackathon.kojikukac.com/";
const apiKey = "3f70fbfa-0301-484a-a4cf-4081431bcffa";

export const MapPage = () => {
    const { data: spots, error } = useAllParkingSpots();

    return <div>{spots && <MyMap data={spots} />} world!</div>;
};
