import mqtt from "mqtt";

//creating MQTT client
export function createMQTTClient(
  brokerUrl,
  clientID,
  deviceId,
  statusTopic
) {
  //message to be sent when the client disconnects
  const willPayload = JSON.stringify({
    deviceId,
    status: "OFFLINE"
  });

  const client = mqtt.connect(brokerUrl, {
    clientID,
    reconnectPeriod: 2000,
    queueQoSZero: false,

    //last will & testament message
    will: {
      topic: statusTopic,
      payload: willPayload,
      qos: 1,
      retain: true
    }
  });

  //handle connection events

  //connected
  client.on("connect", () => {
    console.log("[MQTT] Connected to broker.");
  });

  //reconnected
  client.on("reconnect", () => {
    console.log("[MQTT] Attempting reconnection...");
  });

  //offline
  client.on("offline", () => {
    console.warn("[MQTT] Client is offline.");
  });

  //error
  client.on("error", (error) => {
    console.error("[MQTT] Error:", error.message);
  });

  return client;
}

//publish sensor telemetry
export function publishTelemetry(client, topic, telemetry) {
  if (!client.connected) {
    return;
  }

  const payload = JSON.stringify(telemetry);

  client.publish(
    topic,
    payload,
    { qos: 0, retain: false },
    (error) => {
      if (error) {
        console.error(
          "[MQTT] Telemetry publish error:",
          error.message
        );
        return;
      }

      console.log(`[TELEMETRY] Published to ${topic}`);
      console.log(payload);
    }
  );
}

//publish device status
export function publishStatus(
  client,
  topic,
  deviceId,
  status,
  callback = () => {}
) {
  if (!client.connected) {
    callback(new Error("MQTT client is not connected"));
    return;
  }

  const payload = JSON.stringify({
    deviceId,
    status
  });

  client.publish(
    topic,
    payload,
    { qos: 1, retain: true },
    (error) => {
      if (error) {
        console.error(
          "[MQTT] Status publish error:",
          error.message
        );
      } else {
        console.log(`[STATUS] Published ${status}`);
      }

      callback(error);
    }
  );
}