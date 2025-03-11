import type { Header } from "./headers.ts";
import { errors } from "./constants.ts";
import { headerFromBuffer } from "./headers.ts";

type Response = {
  header: Header;
  payload: Uint8Array;
};

function responseFromBuffer(buf: Uint8Array): Response {
  const header = headerFromBuffer(buf);
  const payload = buf.slice(16, header.payloadSize);

  return { header, payload };
}

function createChanResponse(buf: Uint8Array) {
  const header = headerFromBuffer(buf);
  if (header.command === errors.CREATE_CHAN) {
    throw new Error("Channel creation failed");
  }
  return responseFromBuffer(buf);
}

export { createChanResponse, responseFromBuffer };
