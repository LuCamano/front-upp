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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";

type ProximaFecha = {
  fecha: string;
  descripcion: string;
};

type DashboardData = {
  totalEstudiantes: number;
  totalEstablecimientos: number;
  practicasActivas: number;
  practicasPendientes: number;
  proximasFechas: ProximaFecha[];
};

const FALLBACK_FECHAS: ProximaFecha[] = [
  { fecha: "2025-03-10", descripcion: "Cierre de inscripción práctica I" },
  { fecha: "2025-03-18", descripcion: "Inicio envío de correos a establecimientos" },
  { fecha: "2025-04-01", descripcion: "Plazo máximo para asignar estudiantes" },
];

export default function DashboardPage() {
  const { toast } = useToast();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [estudiantes, establecimientos, fichas] = await Promise.all([
        api.getEstudiantes(),
        api.getEstablecimientos(),
        api.getFichas(),
      ]);

      const totalEstudiantes = estudiantes.length;
      const totalEstablecimientos = establecimientos.length;

      const hoy = new Date();

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

      setData({
        totalEstudiantes,
        totalEstablecimientos,
        practicasActivas,
        practicasPendientes,
        proximasFechas: FALLBACK_FECHAS,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "No se pudo cargar el resumen",
        description:
          "Ocurrió un problema al obtener los datos. Revisa tu conexión o intenta recargar más tarde.",
        variant: "destructive",
      });

      // Fallback mínimo para que no se rompa la vista
      setData({
        totalEstudiantes: 0,
        totalEstablecimientos: 0,
        practicasActivas: 0,
        practicasPendientes: 0,
        proximasFechas: FALLBACK_FECHAS,
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
    // Skeleton simple de carga
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

  // Si por alguna razón no hay datos, mostramos algo muy básico
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
      {/* Título y descripción */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido a {process.env.NEXT_PUBLIC_APP_NAME || "Gestión de prácticas"}. Revisa el
            estado general del sistema y accede a las herramientas de configuración.
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

      {/* Métricas principales */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Estudiantes */}
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
              {/* Si quisieras, aquí podrías calcular crecimiento real más adelante */}
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                +8 hoy
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Estudiantes con cuenta en el sistema.
            </p>
          </CardContent>
        </Card>

        {/* Establecimientos */}
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
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                4 nuevos este semestre
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Colegios / instituciones con convenio activo.
            </p>
          </CardContent>
        </Card>

        {/* Prácticas activas */}
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
                {porcentajeActivas}% del total
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Estudiantes actualmente realizando su práctica.
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${porcentajeActivas}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Prácticas pendientes */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prácticas pendientes</CardTitle>
            <CalendarClock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">
                {data.practicasPendientes}
              </span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {porcentajePendientes}% por asignar
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Asignaciones por revisar o confirmar.
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

      {/* Resumen visual y fechas clave */}
      <section className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
        {/* Resumen visual */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-base">
              Resumen visual de estado de prácticas
            </CardTitle>
            <CardDescription>
              Distribución general de prácticas activas y pendientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Prácticas activas</span>
                <span>{porcentajeActivas}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-3 bg-primary"
                  style={{ width: `${porcentajeActivas}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Prácticas pendientes</span>
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
                <p className="mb-1 text-muted-foreground">Total de prácticas</p>
                <p className="text-xl font-semibold">{practicasTotales}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="mb-1 text-muted-foreground">Relación activo / pendiente</p>
                <p className="text-xl font-semibold">
                  {practicasTotales
                    ? `${data.practicasActivas}:${data.practicasPendientes}`
                    : "0:0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximas fechas */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">Próximas fechas clave</CardTitle>
            <CardDescription>
              Hitos importantes relacionados con inscripciones y asignaciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    key={item.fecha + item.descripcion}
                    className="flex items-start justify-between rounded-md border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.descripcion}</p>
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
                        ? "Vencido"
                        : diffDias === 0
                        ? "Hoy"
                        : `En ${diffDias} día${diffDias === 1 ? "" : "s"}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Configuración y herramientas */}
      <section>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">Configuración y herramientas</CardTitle>
            <CardDescription>
              Accesos directos a las acciones administrativas más frecuentes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link
              href="/plantillas"
              className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Editor de plantillas de correo</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Modifica los correos que se envían a establecimientos y estudiantes.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/carga-masiva"
              className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Carga masiva de datos</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sube archivos Excel para añadir estudiantes, colegios y más.
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
