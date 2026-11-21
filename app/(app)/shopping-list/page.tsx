"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useShoppingList } from "@/hooks/useShoppingList";
import { addShoppingItem, setShoppingItemChecked } from "@/lib/shoppingItems";
import { cn } from "@/lib/utils";

const errorClassName =
  "rounded-md border border-destructive-border bg-destructive-muted px-3 py-2 text-sm text-destructive";

function ShoppingList({ userId }: { userId: string }) {
  const { items, homeId, loading, error, reload } = useShoppingList(userId);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const busy = saving || updatingId !== null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || loading || !homeId) return;
    setMutationError(null);
    setMessage("");

    if (!name.trim()) {
      setMutationError("Ingresá un producto.");
      return;
    }

    setSaving(true);
    try {
      await addShoppingItem(name);
      setName("");
      setMessage("Producto agregado.");
      await reload();
    } catch {
      setMutationError("No se pudo agregar el producto. Tu texto sigue en el formulario.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChecked(itemId: string, checked: boolean) {
    if (busy || loading) return;
    setUpdatingId(itemId);
    setMutationError(null);
    setMessage("");
    try {
      await setShoppingItemChecked(itemId, checked);
      setMessage(checked ? "Producto marcado." : "Producto desmarcado.");
      await reload();
    } catch {
      setMutationError("No se pudo cambiar el estado del producto. Intentá de nuevo.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 lg:space-y-8">
      <header className="space-y-2">
        <Link
          href="/dashboard"
          className="rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Volver a Inicio
        </Link>
        <h1 className="text-2xl font-black text-foreground">Lista del súper</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          La lista compartida de tu hogar. Agregá productos y marcalos cuando los tengas.
        </p>
      </header>

      <Section title="Agregar producto">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-soft">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Producto</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={busy || loading || !homeId}
              required
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
          </label>
          <Button type="submit" disabled={busy || loading || !homeId}>
            {saving ? "Guardando..." : "Agregar producto"}
          </Button>
        </form>
      </Section>

      {mutationError && <p role="alert" className={errorClassName}>{mutationError}</p>}
      <p role="status" className="text-sm text-muted-foreground">{message}</p>

      <Section
        title="Productos"
        action={
          <Button type="button" variant="secondary" disabled={loading || busy} onClick={() => void reload()}>
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        }
      >
        {loading ? (
          <div role="status" className="space-y-2">
            <span className="sr-only">Cargando lista del súper...</span>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <p role="alert" className={errorClassName}>{error}</p>
        ) : !homeId ? (
          <EmptyState title="Necesitás un hogar" description="Configurá tu hogar para usar la lista del súper." />
        ) : items.length === 0 ? (
          <EmptyState title="Tu lista está vacía" description="Agregá el primer producto con el formulario de arriba." />
        ) : (
          <ul className="space-y-2" aria-busy={busy}>
            {items.map((item) => (
              <li key={item.id} className="rounded-lg border border-border bg-card shadow-soft">
                <label className="flex min-h-14 cursor-pointer items-center gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    disabled={busy || loading}
                    onChange={(event) => void handleChecked(item.id, event.target.checked)}
                    className="h-5 w-5 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                  />
                  <span className={cn("min-w-0 break-words text-sm text-foreground", item.checked && "text-muted-foreground line-through")}>
                    {item.name}
                  </span>
                  {updatingId === item.id && <span className="shrink-0 text-xs text-muted-foreground">Guardando...</span>}
                </label>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

export default function ShoppingListPage() {
  const { user, loading } = useAuth();
  if (loading || !user) {
    return <p role="status" className="text-sm text-muted-foreground">Cargando lista del súper...</p>;
  }

  return <ShoppingList key={user.id} userId={user.id} />;
}
