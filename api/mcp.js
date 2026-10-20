export const config={runtime:"nodejs"};
const tools=[{name:"kdp_route",description:"Route a KDP request.",inputSchema:{type:"object",properties:{request:{type:"string"}},required:["request"]}},{name:"kdp_factory_status",description:"Show KDP approval gates.",inputSchema:{type:"object",properties:{}}}];
function send(res,status,obj){res.writeHead(status,{"content-type":"application/json"});res.end(JSON.stringify(obj));}
export default function handler(req,res){
 let body=req.body||{}; if(typeof body==="string") body=JSON.parse(body); const id=body.id, p=body.params||{};
 if(body.method==="notifications/initialized") return send(res,202,{});
 if(body.method==="initialize") return send(res,200,{jsonrpc:"2.0",id,result:{protocolVersion:"2025-03-26",capabilities:{tools:{}},serverInfo:{name:"kdp-factory",version:"0.1.0"}}});
 if(body.method==="tools/list") return send(res,200,{jsonrpc:"2.0",id,result:{tools}});
 if(body.method==="tools/call"&&p.name==="kdp_route"){const q=String(p.arguments?.request||"").toLowerCase();const s=q.includes("outline")?["outline","kdp-book-outliner","Create a commercially focused nonfiction or educational outline."]:["end-to-end","kdp-book-factory","Full approval-gated KDP workflow."];return send(res,200,{jsonrpc:"2.0",id,result:{content:[{type:"text",text:"Recommended workflow: "+s[1]+" — "+s[2]}],structuredContent:{workflow:s[0],skill:s[1],approvalRequired:true}}});}
 if(body.method==="tools/call"&&p.name==="kdp_factory_status")return send(res,200,{jsonrpc:"2.0",id,result:{content:[{type:"text",text:"KDP Factory uses five approval gates; external publishing actions require separate authorization."}],structuredContent:{gates:5,externalActionsRequireExplicitAuthorization:true}}});
 return send(res,200,{jsonrpc:"2.0",id,error:{code:-32601,message:"Unsupported method"}});
}
