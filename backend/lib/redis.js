import { createClient } from 'redis';

export const client = createClient({
    username: 'default',
    password: 'ZOiPD9o0wCRcuvW2mqEIIGOEmrnyjF75',
    socket: {
        host: 'redis-14543.c80.us-east-1-2.ec2.cloud.redislabs.com',
        port: 14543
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

