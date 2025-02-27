import {
  ADDR_LIST,
  commands,
  DEFAULT_PRIORITY,
  DEFAULT_VERSION,
  RESPONSE_SIZE,
} from "./src/constants.ts";
import { DEFAULT_PORT } from "./src/constants.ts";
import {
  getClientNameHeader,
  getCreateChanHeader,
  getHostNameHeader,
  getVersionHeader,
  headerFromBuffer,
  headerToBuffer,
} from "./src/headers.ts";

function requestVersion(priority: number, version: number): Uint8Array {
  const header = getVersionHeader(priority, version);
  return headerToBuffer(header);
}

function requestClientName(username: string): Uint8Array {
  const header = getClientNameHeader(username);
  const payload = new TextEncoder().encode(username);
  return new Uint8Array([...headerToBuffer(header), ...payload]);
}

function requestHostName(hostname: string): Uint8Array {
  const header = getHostNameHeader(hostname);
  const payload = new TextEncoder().encode(hostname);
  return new Uint8Array([...headerToBuffer(header), ...payload]);
}

function requestCreateChan(channelName: string, cid: number, version: number) {
  const header = getCreateChanHeader(channelName, cid, version);
  const payload = new TextEncoder().encode(channelName);
  return new Uint8Array([...headerToBuffer(header), ...payload]);
}

async function handshake(
  conn: Deno.Conn,
  priority: number = DEFAULT_PRIORITY,
  version: number = DEFAULT_VERSION,
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

async function createVirtualCircuit(hostname: string, port: number) {
  let conn;
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

  return { conn };
}

async function main() {
  const { conn } = await createVirtualCircuit(ADDR_LIST[0], DEFAULT_PORT);

  console.log("Connected to server");

  await conn.write(requestCreateChan("test", 1, DEFAULT_VERSION));
  const response = new Uint8Array(RESPONSE_SIZE);
  await conn.read(response);

  console.log(headerFromBuffer(response));
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  main();
}
