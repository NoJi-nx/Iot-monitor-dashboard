//define metrics and their valid ranges
const supportedMetrics = {
    temperature: {min: -50, max: 100},
    humidity: { min: 0, max: 100},
    pressure: { min: 300, max: 1100}
};

//check if an value is a valid object
function isObject(value) {
    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
}

//check if a valid timestamp
function isValidTimestamp(value) {
    if (typeof value !== "string") {
        return false;

}

//UTC timestamps with milliseconds (optional)
const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{1,3}Z$/;

if (!pattern.test(value)) {
    return false;

}

//function to validate timestamp
const date = new Date(value);

if (Number.isNaN(date.getTime())) {
    return false;
}

//reject dates that are not in UTC
return (
    date.toISOString().slice(0, 19) === value.slice(0, 19)
);
}

//function to validate telemetry data
export function validateTelemetry(rawPayload, topicDeviceId) {
    let telemetry;

    //parse json
    try {
        telemetry = JSON.parse(rawPayload);
    } catch {
        return {
            valid: false,
            errors: ["Malformed JSON"]
        };
    }

    const errors = [];

    //validate root object
    if (!isObject(telemetry)) {
        return {
            valid: false,
            errors: ["Telemetry must be a JSON object"]
        };
    }

    //validate device ID
    if (
        typeof telemetry.deviceId !== "string" ||
        !/^[a-zA-Z0-9_-]+$/.test(telemetry.deviceId)
    ) {
        errors.push("Invalid or missing deviceId");
    } else if (
        topicDeviceId !== undefined &&
        telemetry.deviceId !== topicDeviceId
    ) {
        errors.push("Device ID does not match MQTT topic");
    }

    //validate timestamp
    if (!isValidTimestamp(telemetry.timestamp)) {
        errors.push("Invalid or missing timestamp");
    }

    //validate metrics 
    if (
        !isObject(telemetry.metrics) ||
        Object.keys(telemetry.metrics).length === 0
    ){
        errors.push("Missing or empty metrics object");
    } else {
        //validate each measurement
        for (const [metric, value] of Object.entries(
            telemetry.metrics
        )) {
            const range = supportedMetrics[metric];

            if (!Object.hasOwn(supportedMetrics, metric)) {
                errors.push(`Unsupported metric: ${metric}`);
                continue;
            }

            if (
                typeof value !== "number" ||
                !Number.isFinite(value)
            ) {
                errors.push(`${metric} must be a finite number`);
                continue;
            }

            //validate sensor ranges
            if (value < range.min || value > range.max) {
                errors.push(
                    `${metric} must be between ${range.min} and ${range.max}`
                );
            }
         }
    }

    // return validation result
    if (errors.length > 0) {
        return {
            valid: false,
            errors
        };
    }

    return {
        valid: true,
        data: telemetry,
        errors: []
    }
}