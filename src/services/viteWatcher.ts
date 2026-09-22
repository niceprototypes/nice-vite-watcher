import type { Plugin } from "vite"
import type { ViteWatcherOptions } from "../types"
import { registerWatchers } from "../utilities/registerWatchers"
import { getPackageForPath } from "../utilities/getPackageForPath"
import { invalidatePackageModules } from "../utilities/invalidatePackageModules"
import { createKeyedDebouncer } from "../utilities/createKeyedDebouncer"

/**
 * Vite plugin that watches linked package dist folders for changes.
 *
 * This plugin enables hot-reloading for toolkited packages by:
 * 1. Adding dist folders to Vite's file watcher
 * 2. Detecting changes when the package's build process outputs new files
 * 3. Invalidating affected modules in Vite's module graph
 * 4. Triggering a browser reload to reflect the changes
 *
 * The plugin uses debouncing to batch rapid file changes (common during
 * build processes) into a single reload event.
 *
 * @param options - Plugin configuration options
 * @returns A Vite plugin instance
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { viteWatcher } from 'nice-vite-watcher'
 *
 * export default {
 *   plugins: [
 *     viteWatcher({
 *       packages: {
 *         'my-ui-library': '/Users/me/code/my-ui-library',
 *         'my-utils': '/Users/me/code/my-utils',
 *       },
 *       verbose: true,
 *     }),
 *   ],
 * }
 * ```
 */
export function viteWatcher(options: ViteWatcherOptions): Plugin {
  const { packages, watchDir = "dist", verbose = false, debounce = 300 } = options
  const debouncer = createKeyedDebouncer(debounce)

  return {
    name: "nice-vite-watcher",

    configureServer(server) {
      registerWatchers(server, packages, watchDir)

      if (verbose) {
        const pkgNames = Object.keys(packages).join(", ")
        console.log(`[vite-watcher] Watching ${watchDir}/ in: ${pkgNames}`)
      }

      // Listen on both `change` (incremental writes, e.g. tsc --watch) and
      // `add` (post-clean-rebuild reappearance, e.g. npm run build's
      // rm -rf dist && tsc). Without `add`, every full rebuild is invisible
      // to Vite and the cached parse diverges from disk.
      const onPackageFileEvent = (filePath: string) => {
        const pkg = getPackageForPath(filePath, packages, watchDir)
        if (!pkg) return

        debouncer.call(pkg.name, (fileCount) => {
          const invalidatedCount = invalidatePackageModules(
            server,
            pkg.name,
            pkg.path
          )

          if (verbose) {
            const files = fileCount === 1 ? "file" : "files"
            console.log(
              `[vite-watcher] ${pkg.name} changed (${fileCount} ${files}), invalidated ${invalidatedCount} modules`
            )
          }

          server.ws.send({ type: "full-reload" })
        })
      }

      server.watcher.on("change", onPackageFileEvent)
      server.watcher.on("add", onPackageFileEvent)
    },
  }
}
