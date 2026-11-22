"use client";

import Link from "next/link";
import { Ellipsis, LoaderCircle, Plus, RefreshCw, ShoppingBasket, Trash2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useShoppingList } from "@/hooks/useShoppingList";
import { addShoppingItem, clearShoppingList, setShoppingItemChecked } from "@/lib/shoppingItems";
import { cn } from "@/lib/utils";

const errorClassName =
  "rounded-md border border-destructive-border bg-destructive-muted px-3 py-2 text-sm text-destructive";

function ShoppingList({ userId }: { userId: string }) {
  const {
    items, homeId, loading, refreshing, error, reload, appendItem, updateItemChecked, clearItems,
  } = useShoppingList(userId);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const clearDialog = useRef<HTMLDialogElement>(null);
  const actionsMenu = useRef<HTMLDetailsElement>(null);
  const busy = saving || updatingId !== null || clearing;
  const checkedCount = items.filter((item) => item.checked).length;

  function confirmClear() {
    if (busy || loading || refreshing || !homeId || items.length === 0) return;
    if (actionsMenu.current) actionsMenu.current.open = false;
    setClearError(null);
    clearDialog.current?.showModal();
  }

  async function handleClear() {
    if (busy || loading || refreshing || !homeId || items.length === 0) return;
    setClearing(true);
    setClearError(null);
    setMutationError(null);
    setMessage("");
    try {
      await clearShoppingList();
      clearItems();
      setMessage("Lista compartida vaciada.");
      clearDialog.current?.close();
    } catch {
      setClearError("No se pudo vaciar la lista. Los productos siguen visibles. Intentá de nuevo.");
    } finally {
      setClearing(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || loading || refreshing || !homeId) return;
    setMutationError(null);
    setMessage("");

    if (!name.trim()) {
      setMutationError("Ingresá un producto.");
      return;
    }

    setSaving(true);
    try {
      const savedName = name.trim();
      const itemId = await addShoppingItem(savedName);
      appendItem({ id: itemId, name: savedName, checked: false });
      setName("");
      setMessage("Producto agregado.");
    } catch {
      setMutationError("No se pudo agregar el producto. Tu texto sigue en el formulario.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChecked(itemId: string, checked: boolean) {
    if (busy || loading || refreshing) return;
    const previousItem = items.find((item) => item.id === itemId);
    if (!previousItem) return;
    setUpdatingId(itemId);
    updateItemChecked(itemId, checked);
    setMutationError(null);
    setMessage("");
    try {
      await setShoppingItemChecked(itemId, checked);
      setMessage(checked ? "Producto marcado." : "Producto desmarcado.");
    } catch {
      updateItemChecked(itemId, previousItem.checked);
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
        <div className="flex items-center gap-3 pt-2">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-border bg-brand-muted text-primary">
            <ShoppingBasket aria-hidden="true" className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-black text-foreground">Lista del súper</h1>
        </div>
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
              disabled={busy || loading || refreshing || !homeId}
              required
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
          </label>
          <Button type="submit" className="gap-2" disabled={busy || loading || refreshing || !homeId}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            {saving ? "Guardando..." : "Agregar producto"}
          </Button>
        </form>
      </Section>

      <div className="min-h-[4.5rem]">
        {mutationError && <p role="alert" className={errorClassName}>{mutationError}</p>}
        <p role="status" className="text-sm text-muted-foreground">{message}</p>
      </div>

      <Section
        title="Productos"
        action={
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="secondary" className="gap-2" disabled={loading || refreshing || busy} onClick={() => void reload()}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              {loading || refreshing ? "Actualizando..." : "Actualizar"}
            </Button>
            <details
              ref={actionsMenu}
              className="relative"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector("summary")?.focus();
                }
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
              }}
            >
              <summary
                aria-label="Más acciones de la lista"
                className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
              >
                <Ellipsis aria-hidden="true" className="h-5 w-5" />
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-border bg-popover p-1 shadow-soft">
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-destructive hover:bg-destructive-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={busy || loading || refreshing || !homeId || items.length === 0}
                  onClick={confirmClear}
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Vaciar lista
                </button>
              </div>
            </details>
          </div>
        }
      >
        {!loading && homeId && (
          <p className="text-sm font-medium text-muted-foreground">
            {checkedCount} de {items.length} {items.length === 1 ? "producto marcado" : "productos marcados"}
          </p>
        )}
        {error && <p role="alert" className={cn(errorClassName, "mb-3")}>{error}</p>}
        {loading ? (
          <div role="status" className="space-y-2">
            <span className="sr-only">Cargando lista del súper...</span>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !homeId ? (
          !error && <EmptyState title="Necesitás un hogar" description="Configurá tu hogar para usar la lista del súper." />
        ) : items.length === 0 ? (
          <EmptyState title="Tu lista está vacía" description="Agregá el primer producto con el formulario de arriba." />
        ) : (
          <ul className="space-y-3" aria-busy={busy || refreshing}>
            {items.map((item) => (
              <li key={item.id}>
                <label className={cn(
                  "flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-xl border p-4 shadow-soft transition-colors focus-within:ring-2 focus-within:ring-ring",
                  item.checked ? "border-brand-border bg-brand-muted" : "border-input bg-card hover:bg-muted",
                  (busy || refreshing) && "cursor-wait"
                )}>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    disabled={busy || loading || refreshing}
                    onChange={(event) => void handleChecked(item.id, event.target.checked)}
                    className="h-5 w-5 shrink-0 accent-primary disabled:cursor-wait"
                  />
                  <span className={cn("min-w-0 flex-1 break-words text-sm font-medium text-foreground", item.checked && "text-muted-foreground line-through")}>
                    {item.name}
                  </span>
                  {updatingId === item.id && <span className="sr-only">Guardando...</span>}
                </label>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <dialog
        ref={clearDialog}
        aria-labelledby="clear-list-title"
        aria-describedby="clear-list-description"
        aria-busy={clearing}
        onCancel={(event) => {
          if (clearing) event.preventDefault();
        }}
        onClose={() => actionsMenu.current?.querySelector("summary")?.focus()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-card p-6 text-foreground shadow-soft backdrop:bg-background backdrop:opacity-80"
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-destructive-border bg-destructive-muted text-destructive">
          <Trash2 aria-hidden="true" className="h-5 w-5" />
        </div>
        <h2 id="clear-list-title" className="text-xl font-bold">¿Vaciar la lista?</h2>
        <p id="clear-list-description" className="mt-2 text-sm leading-6 text-muted-foreground">
          Vas a eliminar {items.length} {items.length === 1 ? "producto" : "productos"} de la lista compartida de tu hogar, incluidos los que no están marcados. Se vacía para todas las personas del hogar y no se puede deshacer.
          {" "}Si alguien agrega productos antes de confirmar, también se eliminarán.
        </p>
        {clearError && <p role="alert" className={cn(errorClassName, "mt-4")}>{clearError}</p>}
        <p role="status" className="mt-3 min-h-6 text-sm text-muted-foreground">
          {clearing ? "Vaciando la lista compartida..." : ""}
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" disabled={clearing} autoFocus onClick={() => clearDialog.current?.close()}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={clearing}
            className="gap-2 border-destructive-border bg-destructive-muted text-destructive hover:bg-destructive-muted"
            onClick={() => void handleClear()}
          >
            {clearing ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Trash2 aria-hidden="true" className="h-4 w-4" />}
            {clearing ? "Vaciando..." : "Vaciar lista"}
          </Button>
        </div>
      </dialog>
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
