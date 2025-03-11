import {
  getClientNameHeader,
  getCreateChanHeader,
  getHostNameHeader,
  getVersionHeader,
  headerFromBuffer,
  headerToBuffer,
} from "./headers.ts";
import { MAX_MESSAGE_SIZE } from "./constants.ts";
import { concat, copy } from "@std/bytes";

function genPayload(payload: string): Uint8Array {
  const nextMultipleOfEight = Math.ceil(payload.length / 8) * 8;
  if (nextMultipleOfEight > MAX_MESSAGE_SIZE) {
    throw new Error("Payload too large");
  }
  const buffer = new Uint8Array(nextMultipleOfEight);
  copy(new TextEncoder().encode(payload), buffer);
  return buffer;
}

function requestVersion(priority: number, version: number): Uint8Array {
  const header = getVersionHeader(priority, version);
  return headerToBuffer(header);
}

function requestClientName(clientName: string): Uint8Array {
  const payload = genPayload(clientName);
  const header = getClientNameHeader(payload.length);

  return concat([headerToBuffer(header), payload]);
}

function requestHostName(hostname: string): Uint8Array {
  const payload = genPayload(hostname);
  const header = getHostNameHeader(payload.length);

  return concat([headerToBuffer(header), payload]);
}

function requestCreateChan(channelName: string, cid: number, version: number) {
  const payload = genPayload(channelName);
  const header = getCreateChanHeader(payload.length, cid, version);

  return concat([headerToBuffer(header), payload]);
}

export {
  headerFromBuffer,
  requestClientName,
  requestCreateChan,
  requestHostName,
  requestVersion,
};
