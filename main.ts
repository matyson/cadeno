const PAYLOAD_MAX_SIZE = 16368; // 16KB or 16368 bytes
const HEADER_SIZE = 16; // 16 bytes
const MAX_MESSAGE_SIZE = PAYLOAD_MAX_SIZE + HEADER_SIZE;
const RESPONSE_SIZE = 1024;

const commands = {
  VERSION: 0,
  READ: 3,
  ECHO: 23,
};

const DBR_TYPES = {
  DBR_STRING: 0,
  DBR_INT: 1,
  DBR_SHORT: 1,
  DBR_FLOAT: 2,
  DBR_ENUM: 3,
  DBR_CHAR: 4,
  DBR_LONG: 5,
  DBR_DOUBLE: 6,
  DBR_STS_STRING: 7,
  DBR_STS_INT: 8,
  DBR_STS_SHORT: 8,
  DBR_STS_FLOAT: 9,
  DBR_STS_ENUM: 10,
  DBR_STS_CHAR: 11,
  DBR_STS_LONG: 12,
  DBR_STS_DOUBLE: 13,
  DBR_TIME_STRING: 14,
  DBR_TIME_INT: 15,
  DBR_TIME_SHORT: 15,
  DBR_TIME_FLOAT: 16,
  DBR_TIME_ENUM: 17,
  DBR_TIME_CHAR: 18,
  DBR_TIME_LONG: 19,
  DBR_TIME_DOUBLE: 20,
  DBR_GR_STRING: 21,
  DBR_GR_INT: 22,
  DBR_GR_SHORT: 22,
  DBR_GR_FLOAT: 23,
  DBR_GR_ENUM: 24,
  DBR_GR_CHAR: 25,
  DBR_GR_LONG: 26,
  DBR_GR_DOUBLE: 27,
  DBR_CTRL_STRING: 28,
  DBR_CTRL_INT: 29,
  DBR_CTRL_SHORT: 29,
  DBR_CTRL_FLOAT: 30,
  DBR_CTRL_ENUM: 31,
  DBR_CTRL_CHAR: 32,
  DBR_CTRL_LONG: 33,
  DBR_CTRL_DOUBLE: 34,
  DBR_PUT_ACKT: 35,
  DBR_PUT_ACKS: 36,
  DBR_STSACK_STRING: 37,
  DBR_CLASS_NAME: 38,
};

type Header = {
  command: number; // UINT16 - 2 bytes
  payloadSize: number; // UINT16 or UINT32 - 2 or 4 bytes
  dataType: number; // UINT16 - 2 bytes
  dataCount: number; // UINT16 or UINT32 - 2 or 4 bytes
  param1: number; // UINT32 - 4 bytes
  param2: number; // UINT32 - 4 bytes
};

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

function headerToBuffer(header: Header): Uint8Array {
  const buf = new Uint8Array(16);
  const view = new DataView(buf.buffer);

  view.setUint16(0, header.command, true);
  view.setUint16(2, header.payloadSize, true);
  view.setUint16(4, header.dataType, true);
  view.setUint16(6, header.dataCount, true);
  view.setUint32(8, header.param1, true);
  view.setUint32(12, header.param2, true);

  return buf;
}

function headerFromBuffer(buf: Uint8Array): Header {
  const view = new DataView(buf.buffer);

  return {
    command: view.getUint16(0, true),
    payloadSize: view.getUint16(2, true),
    dataType: view.getUint16(4, true),
    dataCount: view.getUint16(6, true),
    param1: view.getUint32(8, true),
    param2: view.getUint32(12, true),
  };
}

function requestVersion(priority: number, version: number): Uint8Array {
  const header = getVersionHeader(priority, version);
  return headerToBuffer(header);
}

async function main() {
  let conn;
  try {
    conn = await Deno.connect({
      transport: "tcp",
      port: 5064,
      hostname: "0.0.0.0",
    });
  } catch (err) {
    console.log(err);
    Deno.exit(1);
  }
  const req = requestVersion(0, 0);

  await conn.write(req);

  const response = new Uint8Array(RESPONSE_SIZE);
  await conn.read(response);

  console.log(response);
  console.log(headerFromBuffer(response));
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  main();
}
