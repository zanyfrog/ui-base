export interface SourceValidationResult {
  valid: boolean;
  warnings: string[];
}

export function validateSource(sourceText: string): SourceValidationResult {
  return {
    valid: sourceText.length >= 0,
    warnings: [],
  };
}
