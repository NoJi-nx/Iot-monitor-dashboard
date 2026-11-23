import mqtt from "mqtt";

//create an MQTT client
export function createMQTTClient(brokerUrl, clientID) {
    const client = mqtt.connect(brokerUrl, {
        clientID,
        reconnectPeriod: 2000,
        queueQoSZero: false

    });
    //connect event
    client.on("connect", () => {
        console.log("Connected to MQTT broker");
    });
    //reconnect event
    client.on("reconnect", () => {
        console.log("Attempt to reconnecting MQTT broker...");
    });
    //offline event
    client.on("offline", () => {
        console.warn("MQTT client is offline");
    });
    //error event
    client.on("error", (error) => {
        console.error("MQTT error:", error);
    });
    

    return client;
}

//publish telemetry data
export function publishTelemetry(client, topic, telemetry) {
    if (!client.connected) {
        return;
    }

    const payload = JSON.stringify(telemetry);

    
    client.publish(topic, payload, { qos: 0, retain: false },
        (error) => {
            if (error) {
                console.error("MQTT publish error:", error.message);
                return;
            }

            console.log(`Published to ${topic}:`);
            console.log(payload);
        }
    );
}