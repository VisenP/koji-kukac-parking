import { EventHubConsumerClient, latestEventPosition } from "@azure/event-hubs";

import { io } from "./listener";

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
