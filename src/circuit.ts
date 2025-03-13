import type { AccessRights, Channel } from "./types.ts";
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

export async function handshake(
  conn: Deno.Conn,
  priority: number = DEFAULT_PRIORITY,
  version: number = MINOR_PROTOCOL_VERSION,
) {
  const result = await Promise.allSettled([
    conn.write(requestVersion(priority, version).raw),
    conn.write(requestClientName("deno").raw),
    conn.write(requestHostName(Deno.hostname()).raw),
  ]);

  result.forEach((res) => {
    if (res.status === "rejected") {
      console.log(res.reason);
    }
  });

  const response = new Uint8Array(RESPONSE_SIZE);
  await conn.read(response);

  return headerFromBuffer(response);
}

export async function createVirtualCircuit(hostname: string, port: number) {
  let conn;
  let channels: Channel[] = [];

  const addChannel = (
    name: string,
    dataType: number,
    cid: number,
    sid: number,
    accessRights: AccessRights,
  ) => {
    channels.push({ name, cid, sid, dataType, accessRights });
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
    console.log(err);
    Deno.exit(1);
  }

  const res = await handshake(conn);
  console.log(res);

  if (res.command !== commands.VERSION) {
    console.log("Invalid response");
    Deno.exit(1);
  }
  console.log("Connected to server");

  return { conn, addChannel, getChannel, getChannels, removeChannel };
}
