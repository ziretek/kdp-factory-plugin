import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const PORT = Number(process.env.PORT || 8787);

const routes = [
  ["end-to-end", "kdp-book-factory", "Full approval-gated KDP workflow from intake through release packaging."],
  ["series", "ziretek-start-book-series", "Create a connected book-series project and continuity structure."],
  ["niche", "kdp-niche-analyst", "Research demand, competitors, BSR evidence, keywords, and content gaps."],
  ["outline", "kdp-book-outliner", "Create a commercially focused nonfiction or educational outline."],
  ["manuscript", "ziretek-kdp-manuscript-core", "Draft or continue a complete publication-ready manuscript."],
  ["edit", "ziretek-kdp-manuscript-editor", "Copyedit and proofread while preserving meaning and voice."],
  ["verify", "ziretek-kdp-manuscript-verifier", "Audit language, structure, and potential IP risks."],
  ["format", "kdp-formatting-cleaner", "Create conservative, reflow-safe Markdown for EPUB."],
  ["activities", "ziretek-kdp-activity-generator", "Generate or audit manuscript-grounded activities for ages 8–12."],
  ["illustrations", "ziretek-kdp-prompt-studio", "Create factual illustration prompt sheets and asset plans."],
  ["translation", "ziretek-kdp-translation-engine", "Localize an approved manuscript into German, Spanish, or French."],
  ["design", "kdp-design-briefer", "Specify paperback, Kindle, and A+ design requirements."],
  ["listing", "kdp-listing-copywriter", "Create compliant titles, descriptions, keywords, and targeting research."]
];

function makeServer() {
  const server = new McpServer({ name: "kdp-factory", version: "0.1.0" });

  server.registerTool("kdp_route", {
    title: "Route KDP request",
    description: "Use this when you need to identify the correct KDP Factory workflow for a book-production request.",
    inputSchema: { request: z.string().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ request }) => {
    const text = request.toLowerCase();
    const match = routes.find(([key]) =>
      (key === "end-to-end" && /(complete|full|factory|publish|release|upload-ready)/.test(text)) ||
      (key !== "end-to-end" && text.includes(key))
    ) || routes.find(([, skill]) => text.includes(skill.toLowerCase()));
    const selected = match || routes[0];
    return {
      content: [{ type: "text", text: `Recommended workflow: ${selected[1]} — ${selected[2]}` }],
      structuredContent: { request, workflow: selected[0], skill: selected[1], purpose: selected[2], approvalRequired: true }
    };
  });

  server.registerTool("kdp_plan", {
    title: "Plan KDP production",
    description: "Use this when you need a concise, resumable plan for a KDP book request before doing production work.",
    inputSchema: {
      topic: z.string().min(1),
      format: z.enum(["paperback", "ebook", "paperback-and-ebook"]).default("paperback-and-ebook"),
      audience: z.string().optional(),
      stage: z.enum(["intake", "research", "manuscript", "production", "release"]).default("intake")
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ topic, format, audience, stage }) => {
    const steps = [
      "Confirm audience, promise, format, marketplace, rights, and output directory.",
      "Research the niche and record current evidence and assumptions.",
      "Approve an outline, then draft and checkpoint the manuscript.",
      "Edit, verify, format, create assets, and prepare metadata.",
      "Run preflight, assemble release files, and request the human proof decision."
    ];
    const start = { intake: 0, research: 1, manuscript: 2, production: 3, release: 4 }[stage];
    const plan = steps.slice(start);
    return {
      content: [{ type: "text", text: `KDP Factory plan for “${topic}” (${format}):\n${plan.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n\nNo external publishing action is performed without separate authorization.` }],
      structuredContent: { topic, format, audience: audience || null, startingStage: stage, steps: plan, approvalGates: 5 }
    };
  });

  server.registerTool("kdp_factory_status", {
    title: "KDP Factory status",
    description: "Use this when you need to understand the KDP Factory approval gates and safe external-action boundary.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async () => ({
    content: [{ type: "text", text: "KDP Factory uses five approval gates: intake/research, manuscript, production, release preparation, and human proof decision. Publishing, uploading, ISBN purchase, proof ordering, pricing, KDP Select enrollment, and title submission require separate explicit authorization." }],
    structuredContent: { gates: 5, externalActionsRequireExplicitAuthorization: true, workflows: routes.map(([key, skill]) => ({ key, skill })) }
  }));

  return server;
}

const httpServer = createServer(async (req, res) => {
  if (req.url !== "/mcp") {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("KDP Factory MCP server. Use /mcp.\n");
    return;
  }
  try {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID(), enableJsonResponse: true });
    const server = makeServer();
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: String(error) }));
  }
});

if (process.env.VERCEL !== "1") {
  httpServer.listen(PORT, "0.0.0.0", () => console.log(`KDP Factory MCP server listening on http://localhost:${PORT}/mcp`));
}

export { makeServer };
