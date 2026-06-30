"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdscripcionRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/asignacion");
  }, [router]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground animate-pulse">Redirigiendo a Asignación...</p>
    </div>
  );
}
