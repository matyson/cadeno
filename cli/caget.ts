import { createVirtualCircuit } from "../src/circuit.ts";
import {
  ADDR_LIST,
  commands,
  HEADER_SIZE,
  MINOR_PROTOCOL_VERSION,
  RESPONSE_SIZE,
  SEARCH_REPLY_FLAGS,
  SERVER_PORT,
} from "../src/constants.ts";
import { read } from "../src/io.ts";
import { requestCreateChan, requestSearch } from "../src/requests.ts";
import {
  decodeAccessRightsResponse,
  decodeCreateChannelResponse,
  decodeSearchResponse,
} from "../src/responses.ts";
import { AccessRights, DBRType } from "../src/types.ts";
import { parseArgs } from "@std/cli/parse-args";

async function main() {
  const flags = parseArgs(Deno.args, {
    boolean: ["help"],
    string: ["channel"],
    alias: {
      help: ["h"],
      channel: ["c"],
    },
  });

  if (flags.help) {
    console.log("Usage: caget -c <channel>");
    Deno.exit(0);
  }

  const channelName = flags.channel;
  if (!channelName) {
    console.log("Channel name is required");
    Deno.exit(1);
  }

  const { conn, addChannel, getChannel } = await createVirtualCircuit(
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
    decodeSearchResponse(buf);
  } catch (err) {
    console.log(err);
  }

  await conn.write(
    requestCreateChan(channelName, 1, MINOR_PROTOCOL_VERSION).raw,
  );

  await conn.read(buf);
  const accessBuf = buf.slice(0, HEADER_SIZE);
  const { header: accessHeader } = decodeAccessRightsResponse(accessBuf);
  if (accessHeader.command !== commands.ACCESS_RIGHTS) {
    throw new Error("Expected access rights response");
  }

  try {
    const createChanBuf = buf.slice(HEADER_SIZE);
    const res = decodeCreateChannelResponse(createChanBuf);
    const { header } = res;
    addChannel({
      name: channelName,
      cid: header.param1,
      sid: header.param2,
      dataType: header.dataType as DBRType,
      accessRights: accessHeader.param2 as AccessRights,
    });
  } catch (err) {
    console.log(err);
  }

  const channel = getChannel(channelName);
  if (!channel) {
    throw new Error("Channel not found");
  }
  const data = await read(channel, conn);
  console.log(channelName, data);
  conn.close();
}

if (import.meta.main) {
  main();
}
