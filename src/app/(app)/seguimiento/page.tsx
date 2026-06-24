"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SeguimientoPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Seguimiento de Prácticas</h1>
        <p className="text-muted-foreground">
          Esta sección ya no está disponible en el sistema.
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
            La funcionalidad de seguimiento fue removida o está siendo rediseñada.
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-[320px] flex flex-col items-center justify-center text-center gap-4">
          <Construction className="h-20 w-20 text-muted-foreground opacity-40" />
          
          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-semibold">Esta sección no se encuentra disponible</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Puede haber sido eliminada, movida a otra parte del sistema o encontrarse en
              proceso de reestructuración.  
              Si crees que esto es un error, consulta con el administrador del sistema.
            </p>
          </div>

          {/* CTA opcional */}
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
