import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
const sessions=new Map();
const ro={readOnlyHint:true,destructiveHint:false,openWorldHint:false};
function makeServer(){const s=new McpServer({name:"kdp-factory",version:"0.1.0"});s.registerTool("kdp_factory_status",{description:"Show KDP approval gates.",inputSchema:{},annotations:ro},async()=>({content:[{type:"text",text:"KDP Factory uses five approval gates; external publishing actions require separate authorization."}],structuredContent:{gates:5,externalActionsRequireExplicitAuthorization:true}}));s.registerTool("kdp_route",{description:"Route a KDP request.",inputSchema:{request:z.string().min(1)},annotations:ro},async({request})=>({content:[{type:"text",text:"Recommended workflow: "+(request.toLowerCase().includes("outline")?"kdp-book-outliner":"kdp-book-factory")}],structuredContent:{approvalRequired:true}}));return s;}
const server=createServer(async(req,res)=>{if(req.url!=="/mcp"){res.writeHead(404);return res.end("Use /mcp");}try{const id=req.headers["mcp-session-id"];let t=id&&sessions.get(id);if(!t){t=new StreamableHTTPServerTransport({sessionIdGenerator:()=>randomUUID(),enableJsonResponse:true,onsessioninitialized:x=>sessions.set(x,t)});await makeServer().connect(t);}await t.handleRequest(req,res);}catch(e){if(!res.headersSent)res.writeHead(500,{"content-type":"application/json"});res.end(JSON.stringify({error:String(e)}));}});server.listen(Number(process.env.PORT||8787),"0.0.0.0");
