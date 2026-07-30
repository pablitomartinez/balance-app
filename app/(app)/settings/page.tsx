import { EmptyState } from "@/components/ui/EmptyState";
import { Section } from "@/components/ui/Section";

// Pantalla de ajustes. Se usará para crear o unirse a un hogar sin cambiar el esquema existente.
export default function SettingsPage() {
  return (
    <Section title="Ajustes del hogar">
      <EmptyState
        title="Configuración pendiente"
        description="El flujo para crear o unirse a un hogar se agregará en el próximo incremento."
      />
    </Section>
  );
}
