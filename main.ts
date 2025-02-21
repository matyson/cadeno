import {
  ADDR_LIST,
  commands,
  DEFAULT_PRIORITY,
  DEFAULT_VERSION,
  REPEATER_PORT,
  RESPONSE_SIZE,
} from "./constants.ts";
import { DEFAULT_PORT } from "./constants.ts";

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

function requestVersion(priority: number, version: number): Uint8Array {
  const header = getVersionHeader(priority, version);
  return headerToBuffer(header);
}

async function registerRepeater() {
  const clientHost = "127.0.0.1";
  const clientPort = 8080;
  const udpSocket = Deno.listenDatagram({
    transport: "udp",
    hostname: clientHost,
    port: clientPort,
  });

  const ipToNumber = (ip: string) =>
    ip
      .split(".")
      .reduce((acc, octet, i) => acc + parseInt(octet) * 256 ** i, 0);

  const registerCommand = headerToBuffer({
    command: commands.REPEATER_REGISTER,
    payloadSize: 0,
    dataType: 0,
    dataCount: 0,
    param1: 0,
    param2: ipToNumber(clientHost),
  });

  const repeaterAddr: Deno.Addr = {
    transport: "udp",
    hostname: ADDR_LIST[0],
    port: REPEATER_PORT,
  };

  await udpSocket.send(registerCommand, repeaterAddr);

  const response = new Uint8Array(RESPONSE_SIZE);
  const [data, _addr] = await udpSocket.receive(response);

  const header = headerFromBuffer(data);
  console.log(header);
  udpSocket.close();
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
  console.log(res);

  if (res.command !== commands.VERSION) {
    console.log("Invalid response");
    Deno.exit(1);
  }

  return { conn };
}

async function main() {
  await registerRepeater();
  const { conn: _conn } = await createVirtualCircuit(
    ADDR_LIST[0],
    DEFAULT_PORT,
  );

  console.log("Connected to server");
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  main();
}
