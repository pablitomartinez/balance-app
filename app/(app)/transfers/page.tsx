import { EmptyState } from "@/components/ui/EmptyState";
import { Section } from "@/components/ui/Section";

// Pantalla de transferencias. Estos movimientos afectan el balance de forma inmediata.
export default function TransfersPage() {
  return (
    <Section title="Transferencias">
      <EmptyState
        title="Transferencias próximamente"
        description="Acá se registrarán pagos directos entre las dos personas del hogar."
      />
    </Section>
  );
}
