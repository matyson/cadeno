import {
  ADDR_LIST,
  commands,
  DEFAULT_PRIORITY,
  MINOR_PROTOCOL_VERSION,
  RESPONSE_SIZE,
  SEARCH_REPLY_FLAGS,
  SERVER_PORT,
} from "./src/constants.ts";
import { headerFromBuffer } from "./src/headers.ts";
import {
  requestClientName,
  requestCreateChan,
  requestHostName,
  requestSearch,
  requestVersion,
} from "./src/requests.ts";
import { createChanResponse, searchResponse } from "./src/responses.ts";

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

  return { conn };
}

async function main() {
  const channelName = "random_walk:x";
  const { conn } = await createVirtualCircuit(ADDR_LIST[0], SERVER_PORT);

  await conn.write(
    requestSearch(
      channelName,
      SEARCH_REPLY_FLAGS.DO_REPLY,
      MINOR_PROTOCOL_VERSION,
      1,
    ),
  );
  const buf = new Uint8Array(RESPONSE_SIZE);
  await conn.read(buf);

  try {
    const res = searchResponse(buf);
    console.log("Channel found");
    console.log(res);
  } catch (err) {
    console.log(err);
  }

  await conn.write(
    requestCreateChan(channelName, 1, MINOR_PROTOCOL_VERSION),
  );
  await conn.read(buf);

  try {
    const res = createChanResponse(buf);
    console.log("Channel created");
    console.log(res);
  } catch (err) {
    console.log(err);
  }
  conn.close();
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  main();
}
