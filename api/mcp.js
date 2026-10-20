import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { makeServer } from "../server.js";

export const config = {
  api: { bodyParser: false },
  runtime: "nodejs"
};

export default async function handler(req, res) {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });
  const server = makeServer();
  await server.connect(transport);
  await transport.handleRequest(req, res);
}
