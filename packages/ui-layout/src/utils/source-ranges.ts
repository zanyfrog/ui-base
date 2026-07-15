export function lineColumnForIndex(sourceText: string, index: number): { line: number; column: number } {
  const safeIndex = Math.max(0, Math.min(index, sourceText.length));
  let line = 1;
  let column = 1;
  for (let cursor = 0; cursor < safeIndex; cursor += 1) {
    if (sourceText[cursor] === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

export function truncateLabel(value: string, max = 48): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}...`;
}
