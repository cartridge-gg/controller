import * as http from "http";
import { AddressInfo } from "net";

type ServerResponse = http.ServerResponse<http.IncomingMessage> & {
  req: http.IncomingMessage;
};

export class CallbackServer {
  private server: http.Server;
  private resolveCallback?: (data: string) => void;
  private rejectCallback?: (error: Error) => void;
  private timeoutId?: NodeJS.Timeout;

  constructor() {
    this.server = http.createServer(this.handleRequest.bind(this));

    // Handle server errors
    this.server.on("error", (error) => {
      console.error("Server error:", error);
      if (this.rejectCallback) {
        this.rejectCallback(error);
      }
    });
  }

  private cleanup() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.server.close();
  }

  private handleRequest(req: http.IncomingMessage, res: ServerResponse) {
    if (!req.url?.startsWith("/callback")) {
      res.writeHead(404);
      res.end();
      return;
    }

    const params = new URLSearchParams(req.url.split("?")[1]);
    const session = params.get("startapp");

    if (!session) {
      console.warn("Received callback without session data");
      res.writeHead(400);
      res.end("Missing session data");
      return;
    }

    if (this.resolveCallback) {
      this.resolveCallback(session);
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<html><body><script>window.close();</script>Session registered successfully. You can close this window.</body></html>",
    );

    this.cleanup();
  }

  async listen(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.server.listen(0, "localhost", () => {
        const address = this.server.address() as AddressInfo;
        const url = `http://localhost:${address.port}/callback`;
        resolve(url);
      });

      this.server.on("error", reject);
    });
  }

  async waitForCallback(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.resolveCallback = resolve;
      this.rejectCallback = reject;

      this.timeoutId = setTimeout(
        () => {
          console.warn("Callback timeout reached");
          reject(new Error("Callback timeout after 5 minutes"));
          this.cleanup();
        },
        5 * 60 * 1000,
      );
    });
  }
}
