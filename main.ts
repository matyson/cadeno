import { createVirtualCircuit } from "./src/circuit.ts";
import {
  ADDR_LIST,
  commands,
  HEADER_SIZE,
  MINOR_PROTOCOL_VERSION,
  RESPONSE_SIZE,
  SEARCH_REPLY_FLAGS,
  SERVER_PORT,
} from "./src/constants.ts";
import { headerFromBuffer } from "./src/headers.ts";
import { requestCreateChan, requestSearch } from "./src/requests.ts";
import {
  decodeCreateChannelResponse,
  decodeSearchResponse,
} from "./src/responses.ts";
import { AccessRights } from "./src/types.ts";

async function main() {
  const channelName = "random_walk:x";
  const { conn, addChannel, getChannels } = await createVirtualCircuit(
    ADDR_LIST[0],
    SERVER_PORT,
  );

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
    const res = decodeSearchResponse(buf);
    console.log("Channel found");
    console.log(res);
  } catch (err) {
    console.log(err);
  }

  await conn.write(
    requestCreateChan(channelName, 1, MINOR_PROTOCOL_VERSION).raw,
  );

  await conn.read(buf);
  const accessBuf = buf.slice(0, HEADER_SIZE);
  const accessHeader = headerFromBuffer(accessBuf);
  if (accessHeader.command !== commands.ACCESS_RIGHTS) {
    throw new Error("Expected access rights response");
  }

  const accessRights = accessHeader.param2 as AccessRights;

  try {
    const createChanBuf = buf.slice(HEADER_SIZE);
    const res = decodeCreateChannelResponse(createChanBuf);
    const { header } = res;
    console.log(res);
    console.log("Channel created");
    addChannel(
      channelName,
      header.dataType,
      header.param1,
      header.param2,
      accessRights,
    );
  } catch (err) {
    console.log(err);
  }
  console.log(getChannels());
  conn.close();
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  main();
}
