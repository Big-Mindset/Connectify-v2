import { createClient } from "redis";
import { performance } from "node:perf_hooks";
import dotenv from "dotenv";
dotenv.config()

const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
        family: 4,
    },
});

await client.connect();

for (let i = 0; i < 10; i++) {
    const start = performance.now();

    await client.ping();

    console.log(`${i}: ${(performance.now() - start).toFixed(2)} ms`);
}

await client.quit();