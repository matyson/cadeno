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
import { Channel } from "./types.ts";

export async function handshake(
  conn: Deno.Conn,
  priority: number = DEFAULT_PRIORITY,
  version: number = MINOR_PROTOCOL_VERSION,
) {
  const result = await Promise.allSettled([
    conn.write(requestVersion(priority, version)),
    conn.write(requestClientName("deno")),
    conn.write(requestHostName(Deno.hostname())),
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
    cid: number,
    sid: number,
    dataType: number,
  ) => {
    channels.push({ name, cid, sid, dataType });
  };
  const getChannel = (name: string) => {
    return channels.find((channel) => channel.name === name);
  };
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

  return { conn, addChannel, getChannel, removeChannel };
}
