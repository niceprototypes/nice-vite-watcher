import type { ViteDevServer } from "vite"
import { join } from "path"
import { existsSync } from "fs"
import type { LinkedPackageMap } from "../types"

/**
 * Registers watch directories with Vite's file watcher.
 *
 * Iterates through all configured packages and adds their watch directories
 * (typically 'dist') to Vite's chokidar file watcher. Only adds directories
 * that actually exist on the filesystem.
 *
 * @param server - The Vite dev server instance
 * @param packages - Map of package names to their local filesystem paths
 * @param watchDir - Subdirectory within each package to watch (e.g., 'dist')
 */
export function registerWatchers(
  server: ViteDevServer,
  packages: LinkedPackageMap,
  watchDir: string
): void {
  for (const pkgPath of Object.values(packages)) {
    // Construct the full path to the watch directory
    const targetPath = join(pkgPath, watchDir)

    // Only add the watcher if the directory exists
    if (existsSync(targetPath)) {
      server.watcher.add(targetPath)
    }
  }
}
