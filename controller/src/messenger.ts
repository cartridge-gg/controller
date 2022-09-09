import { Request, Response } from "./types";
import cuid from "cuid";

export type Message<T = Request | Response> = {
  id?: string;
  type: "request" | "response";
  target: string;
  payload: T;
};

export class Messenger {
  private target: Window;
  private origin: string;
  private pending: MessageEvent<Message<Request>>[] = []

  private defaultHandler = (e: MessageEvent<Message<Request>>) => {
    if (
      e.data.target === "cartridge" &&
      e.data.type === "request"
    ) {
      this.pending.push(e)
    }
  }

  constructor(target?: Window, origin: string = "https://cartridge.gg") {
    this.target = target;
    this.origin = origin;

    if (
      typeof document !== "undefined" &&
      document.body.getAttribute("cartridge") !== "true"
    ) {
      document.body.setAttribute("cartridge", "true");
    }

    window.addEventListener("message", this.defaultHandler)
  }

  onRequest(
    cb: (request: Request, reply: <T = Response>(response: T) => void) => void
  ) {
    window.removeEventListener("message", this.defaultHandler)

    const onResponse = ({
      origin,
      source,
      data: { id },
    }: MessageEvent<Message<Request>>) => (response: Response) => {
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
    }

    for (let i = 0; i < this.pending.length; i++) {
      const {
        data: { payload },
      } = this.pending[i]
      cb(payload as Request, onResponse(this.pending[i]));
    }

    window.addEventListener(
      "message",
      (e: MessageEvent<Message<Request>>) => {
        const {
          data: { type, target, payload },
        } = e
        if (
          target === "cartridge" &&
          type === "request"
        ) {
          cb(payload as Request, onResponse(e));
        }
      }
    );
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
      this.origin
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
