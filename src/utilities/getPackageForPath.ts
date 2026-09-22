import { join } from "path"
import type { LinkedPackageMap, PackageInfo } from "../types"

/**
 * Checks if a file path belongs to a watched package directory.
 *
 * Given a file path from a file change event, determines which package
 * (if any) the file belongs to by checking if the path starts with
 * any of the configured package watch directories.
 *
 * @param filePath - The absolute path of the changed file
 * @param packages - Map of package names to their local filesystem paths
 * @param watchDir - Subdirectory within each package being watched
 * @returns Package info if the file belongs to a watched package, undefined otherwise
 */
export function getPackageForPath(
  filePath: string,
  packages: LinkedPackageMap,
  watchDir: string
): PackageInfo | undefined {
  for (const [pkgName, pkgPath] of Object.entries(packages)) {
    // Construct the full path to the watch directory
    const targetPath = join(pkgPath, watchDir)

    // Check if the changed file is within this package's watch directory
    if (filePath.startsWith(targetPath)) {
      return { name: pkgName, path: pkgPath }
    }
  }

  // File doesn't belong to any watched package
  return undefined
}
