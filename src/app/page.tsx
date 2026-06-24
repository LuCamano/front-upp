import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Inicio | Gestión de prácticas",
};

export default function HomePage() {
  redirect("/dashboard");
}
