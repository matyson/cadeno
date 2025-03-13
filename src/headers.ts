import type { Header } from "./types.ts";
import { commands, HEADER_SIZE } from "./constants.ts";

function headerToBuffer(header: Header): Uint8Array {
  const buf = new Uint8Array(HEADER_SIZE);
  const view = new DataView(buf.buffer);

  view.setUint16(0, header.command);
  view.setUint16(2, header.payloadSize);
  view.setUint16(4, header.dataType);
  view.setUint16(6, header.dataCount);
  view.setUint32(8, header.param1);
  view.setUint32(12, header.param2);

  return buf;
}

function headerFromBuffer(buf: Uint8Array): Header {
  const view = new DataView(buf.buffer);

  return {
    command: view.getUint16(0),
    payloadSize: view.getUint16(2),
    dataType: view.getUint16(4),
    dataCount: view.getUint16(6),
    param1: view.getUint32(8),
    param2: view.getUint32(12),
  };
}

function getVersionHeader(priority: number, version: number): Header {
  return {
    command: commands.VERSION,
    payloadSize: 0,
    dataType: priority,
    dataCount: version,
    param1: 0,
    param2: 0,
  };
}

function getClientNameHeader(payloadSize: number): Header {
  return {
    command: commands.CLIENT_NAME,
    payloadSize,
    dataType: 0,
    dataCount: 0,
    param1: 0,
    param2: 0,
  };
}

function getHostNameHeader(payloadSize: number): Header {
  return {
    command: commands.HOST_NAME,
    payloadSize,
    dataType: 0,
    dataCount: 0,
    param1: 0,
    param2: 0,
  };
}

function getCreateChanHeader(
  payloadSize: number,
  cid: number,
  version: number,
) {
  return {
    command: commands.CREATE_CHAN,
    payloadSize,
    dataType: 0,
    dataCount: 0,
    param1: cid,
    param2: version,
  };
}

function getSearchHeader(
  payloadSize: number,
  reply: number,
  version: number,
  searchID: number,
) {
  return {
    command: commands.SEARCH,
    payloadSize,
    dataType: reply,
    dataCount: version,
    param1: searchID,
    param2: searchID,
  };
}

export {
  getClientNameHeader,
  getCreateChanHeader,
  getHostNameHeader,
  getSearchHeader,
  getVersionHeader,
  type Header,
  headerFromBuffer,
  headerToBuffer,
};
