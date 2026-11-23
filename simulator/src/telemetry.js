//clamp a value between a minimum and maximum
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
//round a value to a specified number of decimal places
function round(value, decimals = 1) {
    return Number(value.toFixed(decimals));
}

//generate a random change within a specified range
function randomChange(maxChange) {
    return (Math.random() * 2 - 1) * maxChange;
}


export function createTelemetryGen() {
    //simulated values
    let temperature = 22.5;
    let humidity = 47.0;
    let pressure = 1013.1;

    return function genTelemetry(deviceID) {
        //change the measurements / placeholder data

    temperature = clamp(
        temperature + randomChange(0.15),
        20,
        80
    );

    humidity = clamp(
        humidity + randomChange(2),
        20,
        80
    );

    pressure = clamp(
        pressure + randomChange(0.1),
        980,
        1040
    );

    //return telemetry data
    return {
        deviceID,
        timestamp: new Date().toISOString(),
        metrics: {
            temperature:round(temperature),
            humidity: round(humidity),
            pressure: round(pressure)
        }
        
    };
};
}