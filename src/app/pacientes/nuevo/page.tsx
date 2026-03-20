import PacienteForm from "./PacienteForm";

export default function NuevoPacientePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 mt-4 lg:mt-0 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Nuevo Paciente
        </h1>
        <p className="text-sm text-gray-500">
          Ingresa los datos básicos para abrir una nueva ficha clínica.
        </p>
      </div>

      <PacienteForm />
    </div>
  );
}
