import { UibTourReservationBase, registerTourElement } from './base-tour-reservation.js';

/**
 * uib-find-reservation
 * Starts a lookup workflow for an existing tour reservation. Shows a toast
 * alert when called and fires uib-tour-find-reservation.
 */
export class UibFindReservation extends UibTourReservationBase {
  constructor() {
    super({
      action: 'find-reservation',
      eventName: 'uib-tour-find-reservation',
      variant: 'find',
      icon: '?',
      eyebrow: 'Find reservation',
      heading: 'Find Reservation',
      description: 'Find an existing reservation by confirmation number and visitor email.',
      actionLabel: 'Find Reservation',
      toastMessage: 'Find reservation component called.'
    });
  }
}

registerTourElement('uib-find-reservation', UibFindReservation);
