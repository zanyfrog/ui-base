import { UibTourReservationBase, registerTourElement } from './base-tour-reservation.js';

/**
 * uib-cancel-reservation
 * Starts a cancellation workflow for an existing tour reservation. Shows a
 * toast alert when called and fires uib-tour-cancel-reservation.
 */
export class UibCancelReservation extends UibTourReservationBase {
  constructor() {
    super({
      action: 'cancel-reservation',
      eventName: 'uib-tour-cancel-reservation',
      variant: 'cancel',
      icon: 'X',
      eyebrow: 'Cancel reservation',
      heading: 'Cancel Reservation',
      description: 'Look up an existing reservation and start a cancellation flow.',
      actionLabel: 'Cancel Reservation',
      toastMessage: 'Cancel reservation component called.'
    });
  }
}

registerTourElement('uib-cancel-reservation', UibCancelReservation);
