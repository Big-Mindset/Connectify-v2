 import { randomUUID, createHash } from "crypto" 

import { faker } from "@faker-js/faker";
import {prisma} from "../prismaClient.js"
import { secure_message } from "./security-e2ee/encryptMessage.js";
import { Roles, status } from "@prisma/client";
faker.seed(42);

const USER_COUNT = 200;
const CHAT_COUNT = 300;
const MIN_MESSAGES = 15;
const MAX_MESSAGES = 35;
const RESET_DB = true;

// KEK (must be 32 bytes)
const kek = createHash("sha256")
  .update(process.env.KEK_KEY || "dev-master-key")
  .digest();

const secure = new secure_message(kek);

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickTwo(arr) {
  let a = pick(arr);
  let b = pick(arr);
  while (a === b) b = pick(arr);
  return [a, b];
}

function randomDate(days = 30) {
  const now = Date.now();
  return new Date(now - Math.random() * days * 24 * 60 * 60 * 1000);
}



export async function main() {
  if (RESET_DB) {
    await reset();
  }


  const used = new Set();

  const users = Array.from({ length: USER_COUNT }, (_, i) => {
    let base = faker.internet.username().toLowerCase().replace(/[^a-z0-9]/g, "");
    let username = base;

    let c = 1;
    while (used.has(username)) {
      username = base + c++;
    }
    used.add(username);

    return {
      id: randomUUID(),
      name: faker.person.fullName(),
      email: `${username}${i}@mail.com`,
      username,
      image: faker.image.avatar(),
      bio: Math.random() > 0.6 ? faker.lorem.sentence() : null,
      emailVerified: Math.random() > 0.5,
      createdAt: randomDate(100),
      updatedAt: randomDate(10),
      lastseen: randomDate(5),
    };
  });

  await prisma.user.createMany({ data: users });

  const userIds = users.map(u => u.id);


  const pairs = new Set();
  const friendships = [];

  while (friendships.length < CHAT_COUNT) {
    const [a, b] = pickTwo(userIds);
    const key = [a, b].sort().join(":");

    if (pairs.has(key)) continue;
    pairs.add(key);

    friendships.push({
      id: randomUUID(),
      user1Id: a,
      user2Id: b,
      createdAt: randomDate(60),
      updatedAt: randomDate(10),
    });
  }

  await prisma.friendship.createMany({ data: friendships });


  const chats = friendships.map(f => ({
    id: randomUUID(),
    friendshipId: f.id,
    createdAt: randomDate(50),
    updatedAt: randomDate(5),
  }));

  await prisma.chat.createMany({ data: chats });

  const participants = chats.flatMap((chat, i) => {
    const f = friendships[i];

    return [
      {
        id: randomUUID(),
        userId: f.user1Id,
        chatId: chat.id,
        role: Roles.MEMBER,
        createdAt: randomDate(50),
        updatedAt: randomDate(5),
      },
      {
        id: randomUUID(),
        userId: f.user2Id,
        chatId: chat.id,
        role: Roles.MEMBER,
        createdAt: randomDate(50),
        updatedAt: randomDate(5),
      },
    ];
  });

  await prisma.chatParticipant.createMany({ data: participants });


  const messages = [];
  const statuses = [];
  const keys = [];

  for (let i = 0; i < chats.length; i++) {
    const chat = chats[i];
    const f = friendships[i];
    const members = [f.user1Id, f.user2Id];

    const count =
      MIN_MESSAGES + Math.floor(Math.random() * (MAX_MESSAGES - MIN_MESSAGES));

    const createdIds = [];

    for (let j = 0; j < count; j++) {
      const text = faker.lorem.sentences(2);

      const encrypted = secure.encryptMessage(text);

      const id = randomUUID();
      const sender = pick(members);
      const receiver = members.find(x => x !== sender);

      messages.push({
        id,
        senderId: sender,
        chatId: chat.id,
        encryptedContent: encrypted.encrypteContent,
        search_index: encrypted.letters_search,
        createdAt: randomDate(40),
        updatedAt: randomDate(5),
      });

      createdIds.push(id);

      keys.push({
        id: randomUUID(),
        vi_v1: encrypted.keys.vi_v1,
        authTag_v1: encrypted.keys.authTag_v1,
        vi_v2: encrypted.keys.vi_v2,
        authTag_v2: encrypted.keys.authTag_v2,
        encryptedDek: encrypted.keys.encryptedDek,
        messageId: id,
        createdAt: new Date(),
      });

      statuses.push({
        id: randomUUID(),
        messageId: id,
        userId: receiver,
        status: status.SENT,
        deliveredAt: new Date(),
        readAt: new Date(),
      });
    }
  }

  for (let i = 0; i < messages.length; i += 500) {
    await prisma.message.createMany({ data: messages.slice(i, i + 500) });
  }

  for (let i = 0; i < statuses.length; i += 500) {
    await prisma.status.createMany({ data: statuses.slice(i, i + 500) });
  }

  for (let i = 0; i < keys.length; i += 500) {
    await prisma.message_securityKeys.createMany({ data: keys.slice(i, i + 500) });
  }


}

