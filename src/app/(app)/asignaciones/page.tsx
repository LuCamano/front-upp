"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AsignacionesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Asignaciones de Prácticas</h1>
        <p className="text-muted-foreground">
          Esta sección ya no se encuentra disponible en el sistema.
        </p>
      </div>

      {/* Card principal */}
      <Card className="border border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-primary" />
            Sección eliminada
          </CardTitle>
          <CardDescription>
            La funcionalidad de asignación de estudiantes fue eliminada o está siendo rediseñada.
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-[320px] flex flex-col items-center justify-center text-center gap-4">
          <Construction className="h-20 w-20 text-muted-foreground opacity-40" />

          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-semibold">
              Esta sección no está disponible actualmente
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Es posible que la funcionalidad haya sido removida, reemplazada o que esté pasando por 
              un proceso de actualización.  
              Si necesitas asistencia o acceso a esta función, contacta al administrador del sistema.
            </p>
          </div>

          {/* CTA */}
          <Link href="/" className="mt-4">
            <Button variant="outline" className="gap-2">
              <ArrowLeftCircle className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
