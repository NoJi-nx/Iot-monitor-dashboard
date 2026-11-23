import test from "node:test";
import assert from "node:assert/strict";

import {
    validateTelemetry
} from "../src/validators/telemetryValidator.js";

//create valid telemetry data for testing
function createValidTelemetry(overrides = {}) {
    return{
        deviceID: "sensor-001",
        timestamp: "2026-11-23T15:30:00.000Z",
        metrics: {
            temperature: 22.6,
            humidity: 47.2,
            pressure: 1013.1
        },
        ...overrides
    };
}

//convert telemetry data to JSON for validation
function validate(telemetry, topicDeviceID = "sensor-001") {
    return validateTelemetry(JSON.stringify(telemetry), topicDeviceID);

}

//complete valid telemetry
test("Accepts valid telemetry data", () => {
    const telemetry = createValidTelemetry();
    const result = validate(telemetry);

    assert.equal(result.valid, true);
    assert.deepEqual(result.data, telemetry);
    assert.deepEqual(result.errors, []);
});

//valid telemetry with fewer metrics
test("Accepts a subset of valid telemetry metrics", () => {
    const telemetry = createValidTelemetry({
        metrics: {
            temperature: 22.6
        }
});

const result = validate(telemetry);

assert.equal(result.valid, true);

});


//malformed JSON
test("Rejects malformed JSON",  () => {
    const result = validateTelemetry(
        '{"deviceID": "sensor-001",',
        "sensor-001"
    );

    assert.equal(result.valid,false);
    assert.ok(result.errors.includes("Malformed JSON"));
});


//invalid root structure
test("Rejiect non-object telemetry", () => {
    for (const payload of ["null", "[]", '"hello"']) {
        const result = validateTelemetry(
            payload,
            "sensor-001"
        );

        assert.equal(result.valid, false);
        assert.ok(result.errors.length > 0);
    }
});


//missing or invalid device IDs
test("Rejects invalid device IDs", () => {
    const invalidIDs = [
        undefined,
        "",
        "    ",
        123
    ];

    for (const deviceID of invalidIDs) {
        const result = validate(
            createValidTelemetry({ deviceID })
        );

        assert.equal(result.valid, false);
        assert.ok(result.errors.includes("Invalid or missing deviceID"));

    }

});

//device ID and topic mismatch
test("Rejects device ID mismatch", () => {
    const telemetry = createValidTelemetry({
        deviceID: "sensor-999"
    });

    const result = validate(
        telemetry,
        "sensor-001"
    );

    assert.equal(result.valid, false);
    assert.ok(result.errors.includes("Device ID does not match MQTT topic"));
});


//invalid timestamps
test("Rejects invalid timestamps", () => {
    const invalidTimestamps = [
        undefined,
        "not-a-date",
        "2026-02-30T12:00:000Z",
        "2026-11-23T15:30:00+01:00"
    ];

    for (const timestamp of invalidTimestamps) {
        const result = validate(
            createValidTelemetry({ timestamp })
        );

        assert.equal(result.valid, false);
        assert.ok(result.errors.includes("Invalid or missing timestamp"));
    }
});

//invalid metrics
test("Rejects missing or invalid metrics", () => {
    const invalidMetrics = [undefined, null, [], {}, "invalid"];

    for (const metrics of invalidMetrics) {
        const result = validate(
            createValidTelemetry({ metrics })
        );

        assert.equal(result.valid, false);
        assert.ok(result.errors.length > 0);
    }

});

//non-numeric measurements
test("Rejects non-numeric measurements", () => {
    const invalidValues = ["hot", null, false];

    for (const temperature of invalidValues) {
        const result = validate(
            createValidTelemetry({ metrics: { temperature } })
        );

        assert.equal(result.valid, false);
        assert.ok(result.errors.includes("temperature must be a finite number"));
    }
});

//out-of-range measurements
test("Rejects out-of-range measurements", () => {
    const invalidMeasurements = [
    ["temperature", -51],
    ["temperature", 101],
    ["humidity", -1],
    ["humidity", 101],
    ["pressure", 299],
    ["pressure", 1101]

    ];

    for (const [metric, value] of invalidMeasurements) {
        const result = validate(
            createValidTelemetry({ metrics: { [metric]: value } })
        );

        assert.equal(result.valid, false);
        assert.ok(result.errors.some(error => error.includes(`${metric} must be between`)));
    }

});

//unsupported metrics
test("Rejects unsupported metrics", () => {
  const telemetry = createValidTelemetry({
    metrics: {
      temperature: 22.6,
      unknownSensor: 500
    }
  });

  const result = validate(telemetry);

  assert.equal(result.valid, false);
  assert.ok(
    result.errors.includes(
      "Unsupported metric: unknownSensor"
    )
  );
});

//recovery after invalid telemetry
test("Valid telemetry works after invalid input", () => {
  //provide malformed JSON first
  const invalidResult = validateTelemetry(
    "{invalid-json}",
    "sensor-001"
  );

  assert.equal(invalidResult.valid, false);

  //then provide valid telemetry
  const validResult = validate(
    createValidTelemetry()
  );

  assert.equal(validResult.valid, true);
});

