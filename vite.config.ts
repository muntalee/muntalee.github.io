import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [
    svelte(),
    {
      name: "streaming-directory-redirect",
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url?.split("?")[0] === "/streaming") {
            response.writeHead(308, { Location: request.url.replace("/streaming", "/streaming/") });
            response.end();
          } else next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url?.split("?")[0] === "/streaming") {
            response.writeHead(308, { Location: request.url.replace("/streaming", "/streaming/") });
            response.end();
          } else next();
        });
      },
    },
  ],
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        streaming: "streaming/index.html",
      },
    },
  },
});
