import { commands } from "./constants.ts";

type Header = {
  command: number; // UINT16 - 2 bytes
  payloadSize: number; // UINT16 or UINT32 - 2 or 4 bytes
  dataType: number; // UINT16 - 2 bytes
  dataCount: number; // UINT16 or UINT32 - 2 or 4 bytes
  param1: number; // UINT32 - 4 bytes
  param2: number; // UINT32 - 4 bytes
};

function headerToBuffer(header: Header): Uint8Array {
  const buf = new Uint8Array(16);
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

function getClientNameHeader(username: string): Header {
  return {
    command: commands.CLIENT_NAME,
    payloadSize: username.length,
    dataType: 0,
    dataCount: 0,
    param1: 0,
    param2: 0,
  };
}

function getHostNameHeader(hostname: string): Header {
  return {
    command: commands.HOST_NAME,
    payloadSize: hostname.length,
    dataType: 0,
    dataCount: 0,
    param1: 0,
    param2: 0,
  };
}

function getCreateChanHeader(
  channelName: string,
  cid: number,
  version: number
) {
  return {
    command: commands.CREATE_CHAN,
    payloadSize: channelName.length,
    dataType: 0,
    dataCount: 0,
    param1: cid,
    param2: version,
  };
}

export {
  type Header,
  headerToBuffer,
  headerFromBuffer,
  getVersionHeader,
  getClientNameHeader,
  getHostNameHeader,
  getCreateChanHeader,
};
