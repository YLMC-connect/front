const overlayLabels = [
  ["development-servers", "DEVELOPMENT SERVERS"],
  ["continue", "Continue"],
  ["reload", "Reload"],
];

export function findDevClientOverlay(uiHierarchy) {
  for (const [state, label] of overlayLabels) {
    const node = uiHierarchy.match(
      new RegExp(`<node[^>]*(?:text|content-desc)="${label}"[^>]*(?:/?>)`),
    )?.[0];
    if (!node) continue;

    const bounds = node.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!bounds) return { state, center: null };

    return {
      state,
      center: {
        x: Math.round((Number(bounds[1]) + Number(bounds[3])) / 2),
        y: Math.round((Number(bounds[2]) + Number(bounds[4])) / 2),
      },
    };
  }

  return null;
}
