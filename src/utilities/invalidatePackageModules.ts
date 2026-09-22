import type { ViteDevServer } from "vite"

/**
 * Invalidates all modules from a specific package in Vite's module graph.
 *
 * Searches through Vite's module graph and invalidates any modules that
 * either have URLs containing the package name or have file paths within
 * the package directory. This ensures that all cached modules from the
 * package are marked as stale and will be re-fetched.
 *
 * @param server - The Vite dev server instance
 * @param pkgName - Name of the package to invalidate
 * @param pkgPath - Filesystem path to the package
 * @returns The number of modules that were invalidated
 */
export function invalidatePackageModules(
  server: ViteDevServer,
  pkgName: string,
  pkgPath: string
): number {
  const { moduleGraph } = server
  let count = 0

  // Iterate through all modules in the graph
  for (const [url, mod] of moduleGraph.urlToModuleMap) {
    // Check if the module URL contains the package name
    // or if the module's file path is within the package directory
    if (mod && (url.includes(pkgName) || mod.file?.includes(pkgPath))) {
      // Mark the module as invalidated so it will be re-fetched
      moduleGraph.invalidateModule(mod)
      count++
    }
  }

  return count
}
