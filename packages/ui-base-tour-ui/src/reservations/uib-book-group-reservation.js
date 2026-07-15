import { UibTourReservationBase, registerTourElement } from './base-tour-reservation.js';

/**
 * uib-book-group-reservation
 * Starts a group tour reservation request. Shows a toast alert when called and
 * fires uib-tour-book-group-reservation.
 */
export class UibBookGroupReservation extends UibTourReservationBase {
  constructor() {
    super({
      action: 'book-group-reservation',
      eventName: 'uib-tour-book-group-reservation',
      variant: 'group',
      icon: 'G',
      eyebrow: 'Group reservation',
      heading: 'Book Group Reservation',
      description: 'Request a tour time for a larger group, school, or organization.',
      actionLabel: 'Book Group Reservation',
      toastMessage: 'Book group reservation component called.'
    });
  }
}

registerTourElement('uib-book-group-reservation', UibBookGroupReservation);
