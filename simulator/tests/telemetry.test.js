import test from "node:test";
import assert from "node:assert/strict";
import {createTelemetryGen} from "../src/telemetry.js";

//verify telemetry fields/structure
test("Telemetry contains required fields", () => {
    const genTelemetry = createTelemetryGen();
    const telemetry = genTelemetry("sensor-001");

    assert.equal(telemetry.deviceId, "sensor-001");
    assert.ok(telemetry.timestamp);
    assert.ok(telemetry.metrics);

    assert.ok("temperature" in telemetry.metrics);
    assert.ok("humidity" in telemetry.metrics);
    assert.ok("pressure" in telemetry.metrics);
});

//verify timestamp
test("timestamp is valid ISO 8601 UTC", () => {
    const genTelemetry = createTelemetryGen();
    const telemetry = genTelemetry("sensor-001");
    const timestamp = telemetry.timestamp;

    assert.equal(
        new Date(timestamp).toISOString(),
        timestamp
    );
});

//verify measurement values
test("Measurements are numeric and within expected ranges", () => {
    const genTelemetry = createTelemetryGen();

    for (let i = 0; i < 10; i++) {
        const { metrics } = genTelemetry("sensor-001");

        assert.ok(Number.isFinite(metrics.temperature));
        assert.ok(Number.isFinite(metrics.humidity));
        assert.ok(Number.isFinite(metrics.pressure));

        assert.ok(metrics.temperature >= 18 && metrics.temperature <= 30);
        assert.ok(metrics.humidity >= 20 && metrics.humidity <= 80);
        assert.ok(metrics.pressure >= 980 && metrics.pressure <= 1040);
    }
});

//verify JSON serialization
test("Telemetry can be serialized into JSON", () => {
  const genTelemetry = createTelemetryGen();

  const telemetry = genTelemetry("sensor-001");

  const json = JSON.stringify(telemetry);
  const parsed = JSON.parse(json);

  assert.deepEqual(parsed, telemetry);
});

//reject wrong device IDs
test("Generator rejects invalid device IDs", () => {
  const genTelemetry = createTelemetryGen();

  assert.throws(
    () => genTelemetry(undefined),
    /deviceId/
  );

  assert.throws(
    () => genTelemetry(""),
    /deviceId/
  );

  assert.throws(
    () => genTelemetry("   "),
    /deviceId/
  );
});