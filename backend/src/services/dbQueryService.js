import { prisma } from "../db/prisma.js";

// get all registered devices
export async function getAllDevices() {
  return prisma.device.findMany({
    select: {
      id: true,
      deviceId: true,
      name: true,
      status: true,
      lastSeen: true
    },
    orderBy: {
      deviceId: "asc"
    }
  });
}

// get a device by its device Id
export async function getDeviceByDeviceId(deviceId) {
  return prisma.device.findUnique({
    where: {
      deviceId
    }
  });
}

//historical measurements
export async function getMeasurementsByDevice(
  deviceId,
  { metric, from, to, limit = 20 } = {}
) {
  //find the device's  database ID
  const device = await prisma.device.findUnique({
    where: { deviceId },
    select: { id: true }
  });

  // Return an empty array if the device doesn't exist
  if (!device) {
    return [];
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("limit must be an integer between 1 and 100");
  }

  //build database filters
  const where = {
    deviceRecordId: device.id
  };

  //metric filter
  if (metric) {
    where.metric = metric;
  }

  //timestamp filter
  if (from || to) {
    where.timestamp = {};

    if (from) {
      where.timestamp.gte = new Date(from);
    }

    if (to) {
      where.timestamp.lte = new Date(to);
    }
  }

  //get matching measurements
  return prisma.measurement.findMany({
    where,
    select: {
      timestamp: true,
      metric: true,
      value: true,
      unit: true
    },
    orderBy: [
      { timestamp: "desc" },
      { metric: "asc" }
    ],
    take: limit
  });
}