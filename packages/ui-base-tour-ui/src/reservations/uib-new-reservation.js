import { UibTourReservationBase, registerTourElement } from './base-tour-reservation.js';

/**
 * uib-new-reservation
 * Starts a new individual tour reservation flow. Shows a toast alert when
 * called and fires uib-tour-new-reservation for the parent application.
 */
export class UibNewReservation extends UibTourReservationBase {
  constructor() {
    super({
      action: 'new-reservation',
      eventName: 'uib-tour-new-reservation',
      variant: 'new',
      icon: '+',
      eyebrow: 'New reservation',
      heading: 'New Reservation',
      description: 'Start a new tour reservation and collect basic visit preferences.',
      actionLabel: 'Start New Reservation',
      toastMessage: 'New reservation component called.'
    });
  }
}

registerTourElement('uib-new-reservation', UibNewReservation);
