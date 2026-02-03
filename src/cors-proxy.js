// This file should be placed in your project root and referenced in your vite.config.js
// or other development server configuration

module.exports = function setupProxy(app) {
    const { createProxyMiddleware } = require("http-proxy-middleware")
  
    // Proxy API requests to the backend
    app.use(
      "/api",
      createProxyMiddleware({
        target: "http://localhost:8000",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/api", // Keep the /api prefix when forwarding to the backend
        },
        onProxyReq: (proxyReq, req, res) => {
          // Add any headers needed for authentication
          // proxyReq.setHeader('Authorization', 'Bearer your-token-here');
        },
        onError: (err, req, res) => {
          console.error("Proxy error:", err)
          res.writeHead(500, {
            "Content-Type": "application/json",
          })
          res.end(JSON.stringify({ message: "Proxy error connecting to backend" }))
        },
      }),
    )
  }
  