import { UibFormControlBase, defineFormControl } from '../form-control-base.js';
export class UibFormsDate extends UibFormControlBase { static inputType = 'date'; static defaultLabel = 'Date'; }
defineFormControl('uib-forms-date', UibFormsDate);
