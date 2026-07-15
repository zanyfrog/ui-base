export function generateSourcePatch(originalText: string, updatedText: string, fileName = 'source'): string {
  if (originalText === updatedText) return `--- ${fileName}\n+++ ${fileName}\n`;

  const originalLines = originalText.split(/\r?\n/);
  const updatedLines = updatedText.split(/\r?\n/);
  const output = [`--- ${fileName}`, `+++ ${fileName}`, '@@'];
  const max = Math.max(originalLines.length, updatedLines.length);

  for (let index = 0; index < max; index += 1) {
    const before = originalLines[index];
    const after = updatedLines[index];
    if (before === after) {
      output.push(` ${before ?? ''}`);
    } else {
      if (before !== undefined) output.push(`-${before}`);
      if (after !== undefined) output.push(`+${after}`);
    }
  }

  return `${output.join('\n')}\n`;
}
