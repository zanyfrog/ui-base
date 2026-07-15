import { UibFormControlBase, defineFormControl } from '../form-control-base.js';
export class UibFormsSelect extends UibFormControlBase { static inputType = 'select'; static controlKind = 'select'; static defaultLabel = 'Select'; }
defineFormControl('uib-forms-select', UibFormsSelect);
