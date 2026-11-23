import mqtt from "mqtt";

import {validateTelemetry} from "../validators/telemetryValidator.js";

export function startMQTTSubscriber() {
  //read env config
  const brokerUrl = process.env.MQTT_URL;
  const clientID = process.env.MQTT_CLIENT_ID;

  const telemetryTopic =
    process.env.MQTT_TELEMETRY_TOPIC;

  const statusTopic =
    process.env.MQTT_STATUS_TOPIC;

  //validate required config
  if (!brokerUrl || !clientID ||
      !telemetryTopic || !statusTopic) {
    throw new Error("Missing MQTT configuration");
  }

  //connect MQTT broker
  const client = mqtt.connect(brokerUrl, {
    clientID,
    reconnectPeriod: 2000,
    resubscribe: false
  });

  //successful connection
  client.on("connect", () => {
    console.log("[MQTT] Connected to broker.");
  });


 client.subscribe(
  {
    [telemetryTopic]: { qos: 0 },
    [statusTopic]: { qos: 1 }
  },
  (error, granted) => {
    if (error) {
      console.error(
        "[MQTT] Subscription error:",
        error.message
      );
      return;
    }

    for (const subscription of granted ?? []) {
      console.log(
        `[MQTT] Subscribed: ${subscription.topic} ` +
        `(QoS ${subscription.qos})`
      );
    }
  }
);

  //handle incoming messages
  client.on("message", (topic, message) => {
    const payload = message.toString();

    const parts = topic.split("/");

    //validate MQTT topic structure

    if (
      parts.length !== 4 ||
      parts[0] !== "iot" ||
      parts[1] !== "devices" ||
      !parts[2]
    ) {
      console.warn("[MQTT] Unexpected topic:", topic);
      return;
    }

    const deviceID = parts[2];
    const messageType = parts[3];

    //handle telemetry messages
    if (messageType === "telemetry") {
        const result = validateTelemetry(payload, deviceID);

        //reject invalid telemetry
        if (!result.valid) {
            console.warn(`[TELEMETRY] Rejected invalid data from ${deviceID}`);
  

        for (const error of result.errors) {
            console.warn(`[VALIDATION] ${error}`);
        }

        return;
    }
  
  
  //accept valid telemetry
  console.log(`[TELEMETRY] Accepted data from ${deviceID}`);

  console.log(JSON.stringify(result.data, null, 2));

  //here stores validated telemetry in PostgreSQL for later use
  return;
}

//handle status messages
 if (messageType === "status") {
    console.log(`[STATUS] Device: ${deviceID}`);
    console.log(payload);
    return;
  }

  //handle unknown messages
  console.warn("[MQTT] Unknown message type:", messageType);
});



  //connection events

  //reconnect
  client.on("reconnect", () => {
    console.log("[MQTT] Attempting reconnection...");
  });

  //offline
  client.on("offline", () => {
    console.warn("[MQTT] Broker connection offline.");
  });

  //error
  client.on("error", (error) => {
    console.error("[MQTT] Error:", error.message);
  });

  return client;
}