const http = require("node:http");
const https = require("node:https");
const { getDefaultConfig } = require("expo/metro-config");

const HOP_BY_HOP = new Set([
  "connection",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

function readApiOrigin() {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function copyHeaders(source, skip = []) {
  const headers = {};
  const skipSet = new Set(skip.map((name) => name.toLowerCase()));
  for (const [name, value] of Object.entries(source)) {
    const key = name.toLowerCase();
    if (HOP_BY_HOP.has(key) || skipSet.has(key) || value == null) continue;
    headers[name] = value;
  }
  return headers;
}

function createApiProxy(target) {
  const client = target.protocol === "https:" ? https : http;
  return function proxyApi(req, res, next) {
    if (!req.url?.startsWith("/api")) {
      next();
      return;
    }

    const proxyReq = client.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || undefined,
        path: req.url,
        method: req.method,
        headers: {
          ...copyHeaders(req.headers, ["host", "origin", "referer"]),
          host: target.host,
        },
      },
      (proxyRes) => {
        res.writeHead(
          proxyRes.statusCode ?? 502,
          copyHeaders(proxyRes.headers),
        );
        proxyRes.pipe(res);
      },
    );

    proxyReq.on("error", () => {
      res.statusCode = 502;
      res.end("API proxy error");
    });
    req.pipe(proxyReq);
  };
}

const config = getDefaultConfig(__dirname);
const apiOrigin = readApiOrigin();

if (apiOrigin) {
  const proxyApi = createApiProxy(apiOrigin);
  const previous = config.server?.enhanceMiddleware;
  config.server = {
    ...config.server,
    enhanceMiddleware: (middleware, metroServer) => {
      const inner = previous ? previous(middleware, metroServer) : middleware;
      return (req, res, next) => {
        proxyApi(req, res, () => inner(req, res, next));
      };
    },
  };
}

module.exports = config;
