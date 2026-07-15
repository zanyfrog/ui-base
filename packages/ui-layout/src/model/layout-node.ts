export type LayoutNodeKind = 'element' | 'component' | 'text' | 'dynamic' | 'fragment' | 'slot' | 'unknown';

export type LayoutEditOperation =
  | 'edit-class'
  | 'add-class'
  | 'remove-class'
  | 'edit-attribute'
  | 'remove-attribute'
  | 'edit-text'
  | 'move'
  | 'wrap'
  | 'unwrap'
  | 'add-child'
  | 'remove'
  | 'readonly';

export interface LayoutSourceRef {
  fileName?: string;
  methodName?: string;
  propertyName?: string;
  start?: number;
  end?: number;
  line?: number;
  column?: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface LayoutNode {
  id: string;
  kind: LayoutNodeKind;
  tagName?: string;
  label: string;
  text?: string;
  classList: string[];
  attributes: Record<string, string>;
  children: LayoutNode[];
  source?: LayoutSourceRef;
  editable: boolean;
  allowedOperations: LayoutEditOperation[];
  warnings: string[];
}
