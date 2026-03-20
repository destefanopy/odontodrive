// Mock data layer to keep strict separation of concerns (SoC)
// Real implementation would use the Supabase wrappers in `infrastructure/`

export interface Patient {
  id: string;
  name: string;
  avatar: string;
  nextAppointment: string;
  status: 'espera' | 'sala' | 'atendido';
}

export const getPatientsToday = async (): Promise<Patient[]> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', name: 'Laura Gómez', avatar: 'LG', nextAppointment: '10:00', status: 'sala' },
        { id: '2', name: 'Carlos Díaz', avatar: 'CD', nextAppointment: '11:30', status: 'espera' },
      ]);
    }, 500);
  });
};
