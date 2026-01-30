export type { LinkedPackageMap, ViteWatcherOptions } from "./types"
export { getSourceAliases, viteWatcher } from "./services"

import { viteWatcher } from "./services"

// Default export for convenience
export default viteWatcher