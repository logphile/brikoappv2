// DEAD: V2 overview renderer. Do not import.
// If you see this thrown, something still calls the legacy overview path.

export type DeadParams = Record<string, unknown>;

export function renderProjectOverview(/* _doc: any, _params: DeadParams */) {
  throw new Error(
    "DEAD_RENDER: renderProjectOverview(V2) removed. Use renderOverviewV4."
  );
}

export default renderProjectOverview;
