import {
  getClientNameHeader,
  getCreateChanHeader,
  getHostNameHeader,
  getReadNotifyHeader,
  getSearchHeader,
  getVersionHeader,
  headerToBuffer,
} from "./headers.ts";
import { MAX_MESSAGE_SIZE } from "./constants.ts";
import { concat, copy } from "@std/bytes";
import type { DBRType, Header, Request } from "./types.ts";

function genPayload(payload: string): Uint8Array {
  const encoded = new TextEncoder().encode(payload);
  const nextMultipleOfEight = Math.ceil(encoded.length / 8) * 8;
  if (nextMultipleOfEight > MAX_MESSAGE_SIZE) {
    throw new Error("Payload too large");
  }
  // pad the payload to the next multiple of 8
  const buffer = new Uint8Array(nextMultipleOfEight);
  copy(encoded, buffer);

  return buffer;
}

function raw(header: Header, payload?: Uint8Array): Uint8Array {
  if (payload) {
    return concat([headerToBuffer(header), payload]);
  }
  return headerToBuffer(header);
}

function requestVersion(priority: number, version: number): Request {
  const header = getVersionHeader(priority, version);
  return { header, payload: undefined, raw: raw(header) };
}

function requestClientName(clientName: string): Request {
  const payload = genPayload(clientName);
  const header = getClientNameHeader(payload.length);

  return { header, payload, raw: raw(header, payload) };
}

function requestHostName(hostname: string): Request {
  const payload = genPayload(hostname);
  const header = getHostNameHeader(payload.length);

  return { header, payload, raw: raw(header, payload) };
}

function requestCreateChan(
  channelName: string,
  cid: number,
  version: number,
): Request {
  const payload = genPayload(channelName);
  const header = getCreateChanHeader(payload.length, cid, version);

  return { header, payload, raw: raw(header, payload) };
}

function requestSearch(
  channelName: string,
  reply: number,
  version: number,
  searchID: number,
): Request {
  const payload = genPayload(channelName);
  const header = getSearchHeader(payload.length, reply, version, searchID);

  return { header, payload, raw: raw(header, payload) };
}

function requestReadNotify(
  dataType: DBRType,
  dataCount: number,
  sid: number,
  ioid: number,
): Request {
  const header = getReadNotifyHeader(dataType, dataCount, sid, ioid);
  return { header, payload: undefined, raw: raw(header) };
}

export {
  requestClientName,
  requestCreateChan,
  requestHostName,
  requestReadNotify,
  requestSearch,
  requestVersion,
};
