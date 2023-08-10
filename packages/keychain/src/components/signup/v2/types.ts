import { AccountQuery } from "generated/graphql";

export type FormAction =
  | Action<"form">
  | Action<"signup">
  | Action<"login", AccountQuery>;

type Action<Type extends string, Payload = unknown> = {
  type: Type;
  payload?: Payload;
};
