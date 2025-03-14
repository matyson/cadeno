import { errors, RESPONSE_SIZE } from "./constants.ts";
import { requestReadNotify } from "./requests.ts";
import { decodeReadNotifyResponse, parseData } from "./responses.ts";
import { Channel } from "./types.ts";

async function read(channel: Channel, conn: Deno.Conn) {
  await conn.write(
    requestReadNotify(channel.dataType, 1, channel.sid, 1).raw,
  );

  const buf = new Uint8Array(RESPONSE_SIZE);
  await conn.read(buf);
  const { header, payload } = decodeReadNotifyResponse(buf);
  if (header.command === errors.NOT_FOUND) {
    throw new Error("Channel not found");
  }
  if (!payload) {
    throw new Error("Expected data");
  }
  return parseData(payload, channel.dataType, header.dataCount);
}

export { read };
