import { createVirtualCircuit } from "./src/circuit.ts";
import {
  ADDR_LIST,
  MINOR_PROTOCOL_VERSION,
  RESPONSE_SIZE,
  SEARCH_REPLY_FLAGS,
  SERVER_PORT,
} from "./src/constants.ts";
import { requestCreateChan, requestSearch } from "./src/requests.ts";
import { createChanResponse, searchResponse } from "./src/responses.ts";

async function main() {
  const channelName = "random_walk:x";
  const { conn } = await createVirtualCircuit(ADDR_LIST[0], SERVER_PORT);

  await conn.write(
    requestSearch(
      channelName,
      SEARCH_REPLY_FLAGS.DO_REPLY,
      MINOR_PROTOCOL_VERSION,
      1,
    ).raw,
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
    requestCreateChan(channelName, 1, MINOR_PROTOCOL_VERSION).raw,
  );

  const n = await conn.read(buf);
  console.log(n);

  try {
    const res = createChanResponse(buf);
    console.log(buf);
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
