import type { StorageActionWriter } from "convex/server";
import { assert } from "convex-helpers";
import { Id } from "../_generated/dataModel";

export type ExtractTextContentArgs = {
  storageId: Id<"_storage">;
  bytes?: ArrayBuffer;
};

export async function extractTextContent(
  ctx: { storage: StorageActionWriter },
  args: ExtractTextContentArgs
): Promise<string> {
  const { bytes } = args;

  assert(bytes, "Failed to get file content.");

  return new TextDecoder().decode(bytes);
}