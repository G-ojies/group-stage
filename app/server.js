// Custom Next server. Runs the dev/prod server in THIS process so the HTTP
// listener keeps the event loop alive — avoids the `next dev` CLI wrapper
// exiting immediately in non-TTY/sandboxed environments.
const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`> GroupStage ready on http://localhost:${port} (dev=${dev})`);
    });
  })
  .catch((err) => {
    console.error("Failed to start:", err);
    process.exit(1);
  });
