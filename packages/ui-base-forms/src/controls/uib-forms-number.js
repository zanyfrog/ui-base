import { UibFormControlBase, defineFormControl } from '../form-control-base.js';
export class UibFormsNumber extends UibFormControlBase { static inputType = 'number'; static defaultLabel = 'Number'; }
defineFormControl('uib-forms-number', UibFormsNumber);
