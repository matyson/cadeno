import type { Channel } from "./types.ts";
import {
  commands,
  DEFAULT_PRIORITY,
  MINOR_PROTOCOL_VERSION,
  RESPONSE_SIZE,
} from "./constants.ts";
import { headerFromBuffer } from "./headers.ts";
import {
  requestClientName,
  requestHostName,
  requestVersion,
} from "./requests.ts";

function getClientName() {
  const envVars = ["USER", "USERNAME", "LOGNAME"];
  for (const envVar of envVars) {
    const value = Deno.env.get(envVar);
    if (value) {
      return value;
    }
  }
  return "deno";
}

function getHostName() {
  return Deno.hostname();
}

export async function handshake(
  conn: Deno.Conn,
  priority: number = DEFAULT_PRIORITY,
  version: number = MINOR_PROTOCOL_VERSION,
) {
  const result = await Promise.allSettled([
    conn.write(requestVersion(priority, version).raw),
    conn.write(requestClientName(getClientName()).raw),
    conn.write(requestHostName(getHostName()).raw),
  ]);

  result.forEach((res) => {
    if (res.status === "rejected") {
      throw new Error(`Failed to handshake: ${res.reason}`);
    }
  });

  const response = new Uint8Array(RESPONSE_SIZE);
  await conn.read(response);

  return headerFromBuffer(response);
}

export async function createVirtualCircuit(hostname: string, port: number) {
  let conn;
  let channels: Channel[] = [];

  const addChannel = (channel: Channel) => {
    channels.push(channel);
  };
  const getChannel = (name: string) => {
    return channels.find((channel) => channel.name === name);
  };
  const getChannels = () => channels;
  const removeChannel = (name: string) => {
    channels = channels.filter((channel) => channel.name !== name);
  };

  try {
    conn = await Deno.connect({
      transport: "tcp",
      port: port,
      hostname: hostname,
    });
  } catch (err) {
    throw new Error(`Failed to connect to ${hostname}:${port}> ${err}`);
  }

  try {
    const res = await handshake(conn);

    if (res.command !== commands.VERSION) {
      throw new Error("Expected version response");
    }
  } catch (err) {
    throw new Error(`Failed to handshake: ${err}`);
  }
  return { conn, addChannel, getChannel, getChannels, removeChannel };
}
