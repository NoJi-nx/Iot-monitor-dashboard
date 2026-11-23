
import { startMQTTSubscriber } from "./mqtt/mqttClient.js";

console.log("IoT Monitoring Dashboard: Backend initialized.");
console.log("Starting MQTT subscriber...");

//starting MQTT communication
const mqttClient = startMQTTSubscriber();

//shutdown
function shutdown() {
  console.log("Stopping backend..");

  mqttClient.end(false, () => {
    console.log("MQTT connection closed.");
    process.exit(0);
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);