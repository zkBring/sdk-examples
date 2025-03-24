import { Buffer } from "buffer";

// Attach Buffer to the global scope (window in browsers)
if (typeof window !== "undefined") {
  (window as any).Buffer = Buffer;
}
