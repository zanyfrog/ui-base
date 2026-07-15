export type LayoutOperation =
  | AddClassOperation
  | RemoveClassOperation
  | SetAttributeOperation
  | RemoveAttributeOperation
  | SetTextOperation
  | MoveNodeOperation
  | WrapNodeOperation
  | UnwrapNodeOperation;

export interface BaseLayoutOperation {
  id: string;
  nodeId: string;
  type: string;
}

export interface AddClassOperation extends BaseLayoutOperation {
  type: 'add-class';
  className: string;
}

export interface RemoveClassOperation extends BaseLayoutOperation {
  type: 'remove-class';
  className: string;
}

export interface SetAttributeOperation extends BaseLayoutOperation {
  type: 'set-attribute';
  name: string;
  value: string;
}

export interface RemoveAttributeOperation extends BaseLayoutOperation {
  type: 'remove-attribute';
  name: string;
}

export interface SetTextOperation extends BaseLayoutOperation {
  type: 'set-text';
  value: string;
}

export interface MoveNodeOperation extends BaseLayoutOperation {
  type: 'move-node';
  newParentNodeId: string;
  newIndex: number;
}

export interface WrapNodeOperation extends BaseLayoutOperation {
  type: 'wrap-node';
  wrapperTagName: string;
  wrapperClassList?: string[];
  wrapperAttributes?: Record<string, string>;
}

export interface UnwrapNodeOperation extends BaseLayoutOperation {
  type: 'unwrap-node';
}
