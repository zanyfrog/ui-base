import { UibFormControlBase, defineFormControl } from '../form-control-base.js';
export class UibFormsPhone extends UibFormControlBase { static inputType = 'tel'; static defaultLabel = 'Phone'; }
defineFormControl('uib-forms-phone', UibFormsPhone);
