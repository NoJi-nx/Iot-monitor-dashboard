import {createTelemetryGen} from "./telemetry.js";


//read env config

const deviceID = process.env.DEVICE_ID;

const interval = Number(
    process.env.TELEMETRY_INTERVAL_MS
);

//validate config
if (!deviceID) {
    console.error("Missing DEVICE_ID.");
    process.exit(1);

}

if (!Number.isInteger(interval) || interval < 1000) {
    console.error(
        "TELEMETRY_INTERVAL_MS must be a atleast 1000."
    );
    process.exit(1);
}

//create simulator
const genTelemetry = createTelemetryGen();

function simulateMeasurement() {
    const telemetry = genTelemetry(deviceID);

    console.log(JSON.stringify(telemetry, null, 2));
}

console.log(`Starting simulator: ${deviceID}`);
console.log(`Measurement interval: ${interval} ms`);

//generate first measurement
simulateMeasurement();

//proceed to generate measurements periodically
setInterval(simulateMeasurement, interval);