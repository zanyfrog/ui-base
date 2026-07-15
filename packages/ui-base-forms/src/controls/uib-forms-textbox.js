import { UibFormControlBase, defineFormControl } from '../form-control-base.js';
export class UibFormsTextbox extends UibFormControlBase { static inputType = 'text'; static defaultLabel = 'Text'; }
defineFormControl('uib-forms-textbox', UibFormsTextbox);
