import { UibFormControlBase, defineFormControl } from '../form-control-base.js';
export class UibFormsEmail extends UibFormControlBase { static inputType = 'email'; static defaultLabel = 'Email'; }
defineFormControl('uib-forms-email', UibFormsEmail);
