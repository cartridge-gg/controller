import { Buffer } from "buffer";
import Controller from "@/utils/controller";

global.Buffer = Buffer;

// TODO: fix `wasm.__wbindgen_add_to_stack_pointer is not a function` error
try {
  window.controller = Controller.fromStore(process.env.EXPO_PUBLIC_ORIGIN!);
} catch (error) {
  console.error(error);
}
