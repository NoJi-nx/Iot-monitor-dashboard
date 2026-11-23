import {createTelemetryGen} from "./telemetry.js";
import {createMQTTClient, publishTelemetry} from "./mqttClient.js";


//read env config
const deviceID = process.env.DEVICE_ID;
const interval = Number(
    process.env.TELEMETRY_INTERVAL_MS
);

const brokerUrl = process.env.MQTT_URL;
const clientID = process.env.MQTT_CLIENT_ID;
const topicPrefix = process.env.MQTT_TOPIC_PREFIX;

//validate config

//device ID is invalid
if (!deviceID || !/^[a-zA-Z0-9_-]+$/.test(deviceID)) {
  throw new Error("Invalid DEVICE_ID");
}

//interval is invalid
if (!Number.isInteger(interval) || interval < 1000) {
  throw new Error("Invalid TELEMETRY_INTERVAL_MS");
}

//MQTT config is missing
if (!brokerUrl || !clientID || !topicPrefix) {
  throw new Error("Missing MQTT configuration values");
}



//MQTT topic
const topic = `${topicPrefix}/${deviceID}/telemetry`;

//Initialize telemetry gen
const genTelemetry = createTelemetryGen();

//connect to MQTT broker
const client = createMQTTClient(brokerUrl, clientID);

//gen & publish telemetry
function sendTelemetry() {
  if (!client.connected) {
    return;
  }

  const telemetry = genTelemetry(deviceID);

  publishTelemetry(client, topic, telemetry);
}

//publish after connecting
client.on("connect", () => {
  sendTelemetry();
});

//publish at the configured interval
const timer = setInterval(sendTelemetry, interval);

console.log(`Starting simulator: ${deviceID}`);
console.log(`MQTT broker: ${brokerUrl}`);
console.log(`MQTT topic: ${topic}`);
console.log(`Interval: ${interval} ms`);

//shutdown
function shutdown() {
  console.log("Stopping simulator...");

  clearInterval(timer);

  client.end(false, () => {
    console.log("MQTT connection closed.");
    process.exit(0);
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);