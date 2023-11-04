import { EventHubConsumerClient, latestEventPosition } from "@azure/event-hubs";

import { parkingAxios } from "../../api/evaluatorAxios";
import { Database } from "../database/Database";
import { Logger } from "../lib/logger";
import { io } from "./listener";

type ParkingSpot = {
    id: string;
    latitude: number;
    longitude: number;
    occupied: boolean;
    parkingSpotZone: string;
};

/*
    Explanation:
    - EventHubConsumerClient is used to consume events from an Event Hub.
    - latestEventPosition is used to start receiving events from the moment of calling subscribe. (This will prevent getting past events.)
    - if you are more familiar with Kafka, you can also use Kafka client to consume events from Event Hub, but it is not recommended.
 */
export const wrapper = async () => {
    const connectionString =
        "Endpoint=sb://cbq-hackathon.servicebus.windows.net/;SharedAccessKeyName=n;SharedAccessKey=xd0VzlorTJ9ngm6g0p5qPtXcf1FroyGS7+AEhCVqqhA=;EntityPath=team1";

    const eventHubName = "team1";
    const consumerGroup = "$default";

    const consumerClient = new EventHubConsumerClient(
        consumerGroup,
        connectionString,
        eventHubName
    );

    const parkingSpotsResponse = await parkingAxios.get<{
        data: ParkingSpot[];
    }>("https://hackathon.kojikukac.com/api/ParkingSpot/getAll", {});

    // ts-ignore
    const parkingSpots: ParkingSpot[] = parkingSpotsResponse.data;

    Logger.info(parkingSpots.length);

    for (const spot of parkingSpots) {
        const databaseSpot = await Database.selectOneFrom("parking_spots", ["id"], {
            id: spot.id,
        });

        await (databaseSpot
            ? Database.update(
                  "parking_spots",
                  {
                      longitude: spot.longitude,
                      latitude: spot.latitude,
                      occupied: spot.occupied,
                      zone: spot.parkingSpotZone,
                  },
                  {
                      id: spot.id,
                  }
              )
            : Database.insertInto("parking_spots", {
                  id: spot.id,
                  longitude: spot.longitude,
                  latitude: spot.latitude,
                  occupied: spot.occupied,
                  zone: spot.parkingSpotZone,
              }));
    }

    const subscription = consumerClient.subscribe(
        {
            processEvents: async (events, context) => {
                console.log(`Received events: ${events.length}`);

                if (events.length === 0) {
                    console.log("No events received within wait time. Waiting for next interval");

                    return;
                }

                for (const event of events) {
                    console.table(event.body);
                    const id = event.body["Id"];
                    const occupied = event.body["IsOccupied"];

                    console.log(typeof occupied);

                    console.log(occupied);

                    await Database.update(
                        "parking_spots",
                        {
                            occupied: occupied,
                        },
                        {
                            id: id,
                        }
                    );

                    Logger.debug("Done!");

                    io.emit("ps", event.body);
                }

                await context.updateCheckpoint(events[events.length - 1]);
            },

            processError: async (error, context) => {
                console.log(`Error : ${error}`);
            },
        },
        { startPosition: latestEventPosition }
    );

    console.log("subscription setup done", subscription.isRunning);
};
