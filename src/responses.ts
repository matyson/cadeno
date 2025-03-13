import type { Header, Response } from "./types.ts";
import { errors, HEADER_SIZE } from "./constants.ts";
import { headerFromBuffer } from "./headers.ts";

function payloadFromBuffer(buf: Uint8Array, payloadSize: number): Uint8Array {
  return buf.slice(HEADER_SIZE, HEADER_SIZE + payloadSize);
}

function response(header: Header, payload: Uint8Array): Response {
  return { header, payload };
}

function decode(buf: Uint8Array): Response {
  const header = headerFromBuffer(buf);
  return response(header, payloadFromBuffer(buf, header.payloadSize));
}

function decodeCreateChannelResponse(buf: Uint8Array): Response {
  const res = decode(buf);
  if (res.header.command === errors.CREATE_CHAN) {
    throw new Error("Channel creation failed");
  }
  return res;
}

function decodeSearchResponse(buf: Uint8Array): Response {
  const res = decode(buf);
  if (res.header.command === errors.NOT_FOUND) {
    throw new Error("Channel not found");
  }
  return res; // payload is server version UINT16
}

export { decodeCreateChannelResponse, decodeSearchResponse };
