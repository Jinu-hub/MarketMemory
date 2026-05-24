function normalizePath(path: string): string {
  const pathOnly = path.split("?")[0]?.split("#")[0] ?? path;
  if (pathOnly.length > 1 && pathOnly.endsWith("/")) {
    return pathOnly.slice(0, -1);
  }
  return pathOnly || "/";
}

const ITEM_REPORTS_NAV_SEGMENTS = new Set(["explore", "timeline"]);

/**
 * Whether a sidebar sub-item should show the active highlight for the current URL.
 */
export function isSidebarNavSubItemActive(
  pathname: string,
  url: string,
): boolean {
  const current = normalizePath(pathname);
  const target = normalizePath(url);

  if (current === target) {
    return true;
  }

  if (!current.startsWith(`${target}/`)) {
    return false;
  }

  if (target === "/item_reports") {
    const segment = current.slice(target.length + 1).split("/")[0];
    return segment ? !ITEM_REPORTS_NAV_SEGMENTS.has(segment) : false;
  }

  return true;
}

export function isSidebarNavGroupActive(
  pathname: string,
  items?: { url: string; soon?: boolean }[],
): boolean {
  return (
    items?.some(
      (item) => !item.soon && isSidebarNavSubItemActive(pathname, item.url),
    ) ?? false
  );
}
