import {
  commands,
  DEFAULT_PRIORITY,
  DEFAULT_VERSION,
  RESPONSE_SIZE,
} from "./constants.ts";

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

async function handshake(
  conn: Deno.Conn,
  priority: number = DEFAULT_PRIORITY,
  version: number = DEFAULT_VERSION,
) {
  const req = requestVersion(priority, version);
  await conn.write(req);

  const response = new Uint8Array(RESPONSE_SIZE);

  await conn.read(response);
  return headerFromBuffer(response);
}

async function createVirtualCircuit(hostname: string, port: number) {
  let conn;
  try {
    conn = await Deno.connect({
      transport: "tcp",
      port: port,
      hostname: hostname,
    });
  } catch (err) {
    console.log(err);
    Deno.exit(1);
  }

  const res = await handshake(conn);

  if (res.command !== commands.VERSION) {
    console.log("Invalid response");
    Deno.exit(1);
  }

  return { conn };
}

async function main() {
  const { conn: _conn } = await createVirtualCircuit("localhost", 5064);

  console.log("Connected to server");
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  main();
}
