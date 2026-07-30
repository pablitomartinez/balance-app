import { EmptyState } from "@/components/ui/EmptyState";
import { Section } from "@/components/ui/Section";

// Pantalla de aprobaciones. Por ahora muestra el estado vacío del MVP incremental.
export default function ApprovalsPage() {
  return (
    <Section title="Aprobaciones">
      <EmptyState
        title="No hay gastos para aprobar"
        description="Cuando la otra persona cree un gasto, vas a poder confirmarlo desde acá."
      />
    </Section>
  );
}
