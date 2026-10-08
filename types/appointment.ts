export type AppointmentType = 'Psychologist' | 'Psychiatrist' | 'Doctor' | 'Exercise' | 'Tracing' | 'Other';

/** Cita guardada en el dispositivo (mismo formato que usaba localStorage en el prototipo). */
export interface Appointment {
  type: AppointmentType;
  /** Fecha escrita por el usuario, formato dd/mm/aaaa. */
  date: string;
  startTime: string;
  place: string;
  reminder: boolean;
  doctor: string;
}
