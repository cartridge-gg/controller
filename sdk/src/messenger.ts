import { Request, Response } from "./types";
import cuid from "cuid";

type Message<T = Request | Response> = {
  id?: string;
  type: "request" | "response";
  target: string;
  payload: T;
};

export class Messenger {
  private target: Window;
  private onRequestHandler: (
    request: Request,
    respond: (response: Response) => void
  ) => void;

  constructor(target?: Window) {
    this.target = target;
    if (
      typeof document !== "undefined" &&
      document.body.getAttribute("cartridge") !== "true"
    ) {
      window.addEventListener(
        "message",
        ({
          origin,
          source,
          data: { id, type, target, payload },
        }: MessageEvent<Message<Request>>) => {
          if (
            target === "cartridge" &&
            type === "request" &&
            this.onRequestHandler
          ) {
            this.onRequestHandler(payload as Request, (response: Response) => {
              source.postMessage(
                {
                  id,
                  target: "cartridge",
                  type: "response",
                  payload: {
                    origin: window.origin,
                    ...response,
                  },
                },
                { targetOrigin: origin }
              );
            });
          }
        }
      );
      document.body.setAttribute("cartridge", "true");
    }
  }

  onRequest(
    cb: (request: Request, reply: <T = Response>(response: T) => void) => void
  ) {
    this.onRequestHandler = cb;
  }

  send<T = Response>(request: Request): Promise<T> {
    const id = cuid();
    if (!this.target) {
      throw new Error("read only");
    }

    this.target.postMessage(
      {
        id,
        target: "cartridge",
        type: "request",
        payload: {
          origin: window.origin,
          ...request,
        },
      },
      "process.env.ORIGIN"
    );

    return new Promise((resolve, reject) => {
      const handler = ({ data }: MessageEvent<Message<T>>) => {
        if (
          data.target === "cartridge" &&
          data.type === "response" &&
          id === data.id
        ) {
          resolve(data.payload);
          window.removeEventListener("message", handler);
        }
      };

      window.addEventListener("message", handler);
    });
  }
}
