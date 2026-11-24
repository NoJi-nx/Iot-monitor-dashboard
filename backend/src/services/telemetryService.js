import { prisma } from "../db/prisma.js";

//units for supported sensor measurements
const metricUnits = {
    temperature: "°C",
    humidity: "%",
    pressure: "hPa"
};


export async function saveTelemetry(telemetry) {
    const { deviceId, timestamp, metrics} = telemetry;
    const measuredAt = new Date(timestamp);

    //convert metrics object into database records
    const measurements = Object.entries(metrics).map(
        ([metric, value]) => ({
            timestamp: measuredAt,
            metric,
            value,
            unit: metricUnits[metric]
        })
    );

    //store everything in database
    return prisma.$transaction(async (tx) => {

        //find or create the device
        const device = await tx.device.upsert({
            where: { deviceId },
            update: {},
            create: { deviceId, name: deviceId }
        });

        //find or create the device
        const result = await tx.measurement.createMany({
            data: measurements.map((measurement) => ({
                deviceRecordId: device.id,
                ...measurement
            })),
            skipDuplicates: true
        });

        //update lastSeen when new measurements arrive
        if (result.count > 0) {
            await tx.device.updateMany({
                where: {
                    id: device.id,
                    OR: [
                        { lastSeen: null },
                        { lastSeen: { lt: measuredAt}}
                    ]
                },
                data: { lastSeen: measuredAt}
            });
        }

        // return result
        return {
            deviceId,
            measurementsInserted: result.count,
            duplicatesSkipped:measurements.length - result.count
        };
    });
}