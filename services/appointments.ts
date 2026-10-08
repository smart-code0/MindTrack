import AsyncStorage from '@react-native-async-storage/async-storage';

import { Appointment } from '@/types/appointment';

/** Misma clave que usaba localStorage en el prototipo web. */
const STORAGE_KEY = 'mindtrackAppointments';

export async function getAppointments(): Promise<Appointment[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Appointment[]) : [];
  } catch {
    return [];
  }
}

async function saveAppointments(appointments: Appointment[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

export async function addAppointment(appointment: Appointment) {
  const appointments = await getAppointments();
  await saveAppointments([...appointments, appointment]);
}

/** Elimina la cita en la posición indicada y devuelve la lista actualizada. */
export async function removeAppointment(index: number): Promise<Appointment[]> {
  const remaining = (await getAppointments()).filter((_, i) => i !== index);
  await saveAppointments(remaining);
  return remaining;
}

/** "30/06/2026" → "Tuesday, June 30". Si la fecha no es válida, se devuelve tal cual. */
export function formatDateLabel(dateString: string): string {
  const [day, month, year] = dateString.split('/').map(Number);
  if (!day || !month || !year) return dateString;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
}
