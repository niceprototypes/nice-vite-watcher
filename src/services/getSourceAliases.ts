import { join } from "path"
import type { LinkedPackageMap } from "../types"

/**
 * Generates source aliases for packages that support direct source imports.
 *
 * Use this for packages that don't require special build transforms.
 * These packages will get true HMR with state preservation since Vite
 * can directly watch and process the source files.
 *
 * @param packages - Map of package names to their local filesystem paths
 * @param aliasablePackages - List of package names that can use source aliases
 * @param entryPoint - Entry point file within src/ (default: 'index.ts')
 * @returns Record of package names to their source entry points
 *
 * @example
 * ```typescript
 * import { getSourceAliases } from 'nice-vite-watcher'
 *
 * const packages = {
 *   'my-ui-library': '/Users/me/code/my-ui-library',
 *   'my-icon-library': '/Users/me/code/my-icon-library', // uses SVGR
 * }
 *
 * // Only alias packages without special build transforms
 * const aliases = getSourceAliases(packages, ['my-ui-library'])
 *
 * // In vite.config.ts:
 * export default {
 *   resolve: {
 *     alias: {
 *       ...aliases,
 *     }
 *   }
 * }
 * ```
 */
export function getSourceAliases(
  packages: LinkedPackageMap,
  aliasablePackages: string[],
  entryPoint: string = "index.ts"
): Record<string, string> {
  // Build a map of package names to their source entry points
  const aliases: Record<string, string> = {}

  for (const pkgName of aliasablePackages) {
    const pkgPath = packages[pkgName]
    if (pkgPath) {
      // Point to the source entry file instead of the dist output
      aliases[pkgName] = join(pkgPath, "src", entryPoint)
    }
  }

  return aliases
}
