import { prisma } from "../src/db/prisma.js";

//check database connection
async function checkDb() {
    try {
        const result = await prisma.$queryRaw
        `
        SELECT
        current_database() AS "DbName",
        current_user AS "dbUser"
        `
        ;

        console.log("[DATABASE] Connection successful!");
        console.log(result[0]);
        
    } catch (error) {
        console.error("[DATABASE] Connection failed:",
            error.message
        );

        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

await checkDb();