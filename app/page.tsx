import { redirect } from "next/navigation";

// Esta página inicial lleva al usuario al dashboard, donde se valida su sesión.
export default function HomePage() {
  redirect("/dashboard");
}
