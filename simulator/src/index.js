
import { createTelemetryGen } from "./telemetry.js";

import {
  createMQTTClient,
  publishTelemetry,
  publishStatus
} from "./mqttClient.js";

//read env config
const deviceID = process.env.DEVICE_ID;

const interval = Number(
  process.env.TELEMETRY_INTERVAL_MS
);

const brokerUrl = process.env.MQTT_URL;
const clientID = process.env.MQTT_CLIENT_ID;
const topicPrefix = process.env.MQTT_TOPIC_PREFIX;

//validate config

//invalid device ID
if (!deviceID || !/^[a-zA-Z0-9_-]+$/.test(deviceID)) {
  throw new Error("Invalid DEVICE_ID");
}

//invalid interval
if (!Number.isInteger(interval) || interval < 1000) {
  throw new Error("Invalid TELEMETRY_INTERVAL_MS");
}

//missing MQTT config
if (!brokerUrl || !clientID || !topicPrefix) {
  throw new Error("Missing MQTT configuration");
}

//define Topcis
const telemetryTopic =
  `${topicPrefix}/${deviceID}/telemetry`;

const statusTopic =
  `${topicPrefix}/${deviceID}/status`;

//initiate generator
const genTelemetry = createTelemetryGen();

// connect MQTT client with last will config 
const client = createMQTTClient(
  brokerUrl,
  clientID,
  deviceID,
  statusTopic
);

let shuttingDown = false;

//generate & publish measurements
function sendTelemetry() {
  if (shuttingDown || !client.connected) {
    return;
  }

  const telemetry = genTelemetry(deviceID);

  publishTelemetry(client, telemetryTopic, telemetry);
}

// connect or reconnect
client.on("connect", () => {
  if (shuttingDown) {
    return;
  }

  //announce device is offline
  publishStatus(
    client,
    statusTopic,
    deviceID,
    "ONLINE",
    (error) => {
      if (!error && !shuttingDown) {
        sendTelemetry();
      }
    }
  );
});

//publish periodically
const timer = setInterval(sendTelemetry, interval);

console.log(`Starting simulator: ${deviceID}`);
console.log(`Simulator PID: ${process.pid}`);
console.log(`MQTT broker: ${brokerUrl}`);
console.log(`Telemetry topic: ${telemetryTopic}`);
console.log(`Status topic: ${statusTopic}`);
console.log(`Interval: ${interval} ms`);

//shutdown
function shutdown() {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log("Stopping simulator...");

  clearInterval(timer);

  // offline publish before disconnection
  if (client.connected) {
    publishStatus(
      client,
      statusTopic,
      deviceID,
      "OFFLINE",
      () => {
        client.end(false, () => {
          console.log("MQTT connection closed.");
        });
      }
    );
  } else {
    client.end(true, () => {
      console.log("MQTT connection closed.");
    });
  }
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
