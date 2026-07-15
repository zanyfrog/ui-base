import { UibFormControlBase, defineFormControl } from '../form-control-base.js';
export class UibFormsTextarea extends UibFormControlBase { static inputType = 'text'; static controlKind = 'textarea'; static defaultLabel = 'Text area'; }
defineFormControl('uib-forms-textarea', UibFormsTextarea);
