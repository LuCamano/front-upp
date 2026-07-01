"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Users,
  School,
  Activity,
  CalendarClock,
  RefreshCw,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ProximaFecha = {
  fecha: string;
  nombre: string;
  descripcion: string;
};

type DashboardData = {
  totalEstudiantes: number;
  totalEstablecimientos: number;
  practicasActivas: number;
  practicasPendientes: number;
  proximasFechas: ProximaFecha[];
};

export default function DashboardPage() {
  const { toast } = useToast();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [estudiantes, establecimientos, fichas, fechasClave] = await Promise.all([
        api.getEstudiantes(),
        api.getEstablecimientos(),
        api.getFichas(),
        api.getFechasClave(),
      ]);

      const totalEstudiantes = estudiantes.length;
      const totalEstablecimientos = establecimientos.length;

      const hoy = new Date();
      const hoyCero = new Date(hoy);
      hoyCero.setHours(0, 0, 0, 0);

      // Consideramos:
      // - Activa: hoy entre fecha_inicio y fecha_termino
      // - Pendiente: fecha_inicio en el futuro
      const practicasActivas = fichas.filter((ficha) => {
        if (!ficha.fecha_inicio || !ficha.fecha_termino) return false;
        const inicio = new Date(ficha.fecha_inicio);
        const termino = new Date(ficha.fecha_termino);
        return inicio <= hoy && hoy <= termino;
      }).length;

      const practicasPendientes = fichas.filter((ficha) => {
        if (!ficha.fecha_inicio) return false;
        const inicio = new Date(ficha.fecha_inicio);
        return inicio > hoy;
      }).length;

      // Procesar fechas clave: ordenar por cercanía a hoy
      const proximasFechas: ProximaFecha[] = fechasClave
        .map((f) => ({
          fecha: f.fecha,
          nombre: f.nombre,
          descripcion: f.descripcion || "Sin descripción adicional.",
        }))
        .sort((a, b) => {
          const dateA = new Date(a.fecha).getTime();
          const dateB = new Date(b.fecha).getTime();
          const target = hoyCero.getTime();
          
          // Priorizamos las que están por venir, pero mostramos las más cercanas en general
          return Math.abs(dateA - target) - Math.abs(dateB - target);
        })
        .slice(0, 3);

      setData({
        totalEstudiantes,
        totalEstablecimientos,
        practicasActivas,
        practicasPendientes,
        proximasFechas,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "No se pudo cargar el resumen",
        description:
          "Ocurrió un problema al obtener los datos. Revisa tu conexión o intenta recargar más tarde.",
        variant: "destructive",
      });

      setData({
        totalEstudiantes: 0,
        totalEstablecimientos: 0,
        practicasActivas: 0,
        practicasPendientes: 0,
        proximasFechas: [],
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const practicasTotales = useMemo(() => {
    if (!data) return 0;
    return data.practicasActivas + data.practicasPendientes;
  }, [data]);

  const porcentajeActivas = useMemo(() => {
    if (!data || !practicasTotales) return 0;
    return Math.round((data.practicasActivas / practicasTotales) * 100);
  }, [data, practicasTotales]);

  const porcentajePendientes = useMemo(() => {
    if (!practicasTotales) return 0;
    return 100 - porcentajeActivas;
  }, [practicasTotales, porcentajeActivas]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboard();
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-28">
              <CardContent className="flex h-full flex-col justify-center gap-2">
                <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          No se pudieron obtener los datos del sistema.
        </p>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido al sistema de Gestión de Prácticas. Revisa el
            estado general y las fechas próximas de interés.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 md:mt-0"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar datos
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes registrados</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">
                {data.totalEstudiantes}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Estudiantes activos en la base de datos.
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Establecimientos</CardTitle>
            <School className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">
                {data.totalEstablecimientos}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Centros de práctica registrados.
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prácticas activas</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">
                {data.practicasActivas}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {porcentajeActivas}%
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Alumnos en terreno actualmente.
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${porcentajeActivas}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignaciones pendientes</CardTitle>
            <CalendarClock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">
                {data.practicasPendientes}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Procesos de práctica por iniciar.
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-amber-500 dark:bg-amber-400 transition-all"
                style={{ width: `${porcentajePendientes}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-base">
              Distribución de Prácticas
            </CardTitle>
            <CardDescription>
              Comparativa visual entre procesos activos y pendientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Prácticas en curso</span>
                <span>{porcentajeActivas}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-3 bg-primary"
                  style={{ width: `${porcentajeActivas}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Prácticas por iniciar</span>
                <span>{porcentajePendientes}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-3 bg-amber-500 dark:bg-amber-400"
                  style={{ width: `${porcentajePendientes}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="mb-1 text-muted-foreground">Total de fichas</p>
                <p className="text-xl font-semibold">{practicasTotales}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="mb-1 text-muted-foreground">Relación Activo:Pendiente</p>
                <p className="text-xl font-semibold">
                  {data.practicasActivas}:{data.practicasPendientes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">Próximas fechas clave</CardTitle>
            <CardDescription>
              Hitos importantes del calendario académico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.proximasFechas.length > 0 ? (
              <ul className="space-y-3">
                {data.proximasFechas.map((item) => {
                  const fecha = new Date(item.fecha);
                  const hoy = new Date();
                  hoy.setHours(0, 0, 0, 0);
                  fecha.setHours(0, 0, 0, 0);

                  const diffMs = fecha.getTime() - hoy.getTime();
                  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

                  return (
                    <li
                      key={item.fecha + item.nombre}
                      className="group flex items-start justify-between rounded-md border p-3 text-sm transition-colors hover:bg-muted/30"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.nombre}</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p className="max-w-xs">{item.descripcion}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {fecha.toLocaleDateString("es-CL", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={[
                          "ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                          diffDias < 0
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                            : diffDias === 0
                            ? "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                            : diffDias <= 7
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                        ].join(" ")}
                      >
                        {diffDias < 0
                          ? "Pasado"
                          : diffDias === 0
                          ? "Hoy"
                          : `En ${diffDias} d`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarClock className="h-10 w-10 text-muted-foreground opacity-20" />
                <p className="mt-2 text-sm text-muted-foreground">No hay fechas clave registradas.</p>
                <Link href="/fechas-clave" className="mt-2 text-xs text-primary hover:underline">
                  Configurar calendario
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">Herramientas de Gestión</CardTitle>
            <CardDescription>
              Accesos directos a las funciones más utilizadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link
              href="/asignacion"
              className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Nuevo Proceso de Asignación</h3>
                  <p className="text-xs text-muted-foreground">
                    Inicia el flujo guiado para asignar estudiantes a establecimientos.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/plantillas"
              className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Editor de Plantillas</h3>
                  <p className="text-xs text-muted-foreground">
                    Modifica los mensajes automáticos de notificación.
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
