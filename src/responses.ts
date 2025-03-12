import type { Header } from "./headers.ts";
import { errors, HEADER_SIZE } from "./constants.ts";
import { headerFromBuffer } from "./headers.ts";

type Response = {
  header: Header;
  payload: Uint8Array;
};

function payloadFromBuffer(buf: Uint8Array, payloadSize: number): Uint8Array {
  return buf.slice(HEADER_SIZE, HEADER_SIZE + payloadSize);
}

function response(header: Header, payload: Uint8Array): Response {
  return { header, payload };
}

function createChanResponse(buf: Uint8Array) {
  const header = headerFromBuffer(buf);
  if (header.command === errors.CREATE_CHAN) {
    throw new Error("Channel creation failed");
  }
  return response(header, payloadFromBuffer(buf, header.payloadSize));
}

function searchResponse(buf: Uint8Array) {
  const header = headerFromBuffer(buf);
  if (header.command === errors.NOT_FOUND) {
    throw new Error("Channel not found");
  }
  return response(header, payloadFromBuffer(buf, header.payloadSize)); // payload is server version UINT16
}

export { createChanResponse, searchResponse };
