import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Folio has no ISR/revalidation, so the default (no incremental cache) is
// enough. Add an R2 or KV incremental cache here if that changes.
export default defineCloudflareConfig({});
