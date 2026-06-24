"use client";

import { useState, useEffect } from "react";
import { EditableHtmlDisplay } from "@/components/shared/editable-html-display";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import * as api from "@/lib/api";

// --- Helpers de vista previa amigable ---

// Extrae solo el contenido del <body>
const getBodyHtml = (html: string) => {
  if (!html) return "";
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1].trim() : html;
};

// Mapas con nombres legibles para las variables
const ESTABLISHMENT_LABELS: Record<string, string> = {
  "directivo.nombre": "Nombre del directivo",
  "directivo.cargo": "Cargo del directivo",
  "establecimiento.nombre": "Nombre del establecimiento",
  semana_inicio_profesional: "Semana de inicio práctica profesional",
  semana_termino_profesional: "Semana de término práctica profesional",
  numero_semanas_profesional: "Número de semanas práctica profesional",
  semana_inicio_pp: "Semana de inicio prácticas pedagógicas",
  semana_termino_pp: "Semana de término prácticas pedagógicas",
  numero_semanas_pp: "Número de semanas prácticas pedagógicas",
  "ficha.estudiante.rut": "RUT del estudiante",
  "ficha.estudiante.nombre": "Nombre del estudiante",
  "ficha.estudiante.ap_paterno": "Apellido paterno del estudiante",
  "ficha.estudiante.ap_materno": "Apellido materno del estudiante",
  "ficha.estudiante.email": "Correo del estudiante",
  "ficha.fecha_inicio": "Semana de inicio del estudiante",
  "ficha.fecha_termino": "Semana de término del estudiante",
  "ficha.estudiante.carrera": "Carrera del estudiante",
  "ficha.nivel_practica": "Nivel de práctica del estudiante",
};

const STUDENT_LABELS: Record<string, string> = {
  "estudiante.nombre": "Nombre del estudiante",
  "estudiante.ap_paterno": "Apellido paterno del estudiante",
  "estudiante.ap_materno": "Apellido materno del estudiante",
  nombre_establecimiento: "Nombre del establecimiento",
  nivel_practica: "Nivel de práctica",
  semana_inicio: "Semana de inicio",
  semana_termino: "Semana de término",
  "directivo.nombre": "Nombre del directivo",
  "directivo.cargo": "Cargo del directivo",
  "directivo.email": "Correo del directivo",
};

// Convierte {{variable}} en un chip descriptivo y limpia el for/endfor
const buildReadablePreview = (
  rawHtml: string,
  type: "establecimiento" | "estudiante"
) => {
  if (!rawHtml) return "";

  const labels = type === "establecimiento" ? ESTABLISHMENT_LABELS : STUDENT_LABELS;

  let body = getBodyHtml(rawHtml);

  // Reemplazar bucle por un texto explicativo
  body = body.replace(
    /\{%\s*for\s+ficha\s+in\s+fichas\s*%\}/g,
    `<p style="margin:8px 0; font-size:11px; color:#64748b;">
      Las filas siguientes se repiten automáticamente por cada estudiante adscrito.
    </p>`
  );
  body = body.replace(/\{%\s*endfor\s*%\}/g, "");

  // Reemplazar {{ variable }} por una "etiqueta" visual descriptiva
  body = body.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, key) => {
    const cleanKey = String(key).trim();
    const label = labels[cleanKey] ?? `Dato automático: ${cleanKey}`;
    return `
      <span
        style="
          display:inline-flex;
          align-items:center;
          padding:2px 6px;
          border-radius:9999px;
          border:1px solid #fde68a;
          background-color:#fffbeb;
          color:#92400e;
          font-size:11px;
          font-family:system-ui, -apple-system, BlinkMacSystemFont;
          margin:0 1px;
        "
      >
        ${label}
      </span>
    `;
  });

  return body;
};

export default function PlantillasPage() {
  const [establishmentTemplate, setEstablishmentTemplate] = useState<string>("");
  const [studentTemplate, setStudentTemplate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<"" | "establishment" | "student">("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const [estTpl, stuTpl] = await Promise.all([
          api.getEstablishmentEmailTemplate(),
          api.getStudentEmailTemplate(),
        ]);
        setEstablishmentTemplate(estTpl || "");
        setStudentTemplate(stuTpl || "");
      } catch (error) {
        toast({
          title: "Error al cargar plantillas",
          description: "No se pudieron obtener las plantillas desde el servidor.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  const handleSave = async (key: "establishment" | "student") => {
    setIsSaving(key);
    try {
      if (key === "establishment") {
        await api.setEstablishmentEmailTemplate(establishmentTemplate);
        toast({
          title: "Plantilla guardada",
          description:
            'La plantilla para "Establecimientos" ha sido guardada en el servidor.',
        });
      } else {
        await api.setStudentEmailTemplate(studentTemplate);
        toast({
          title: "Plantilla guardada",
          description: 'La plantilla para "Estudiantes" ha sido guardada en el servidor.',
        });
      }
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la plantilla en el servidor.",
        variant: "destructive",
      });
    } finally {
      setIsSaving("");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-80 animate-pulse rounded-md bg-muted" />
          <div className="h-[320px] w-full animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Editor de plantillas de correo
        </h1>
        <p className="text-sm text-muted-foreground">
          Aquí puedes revisar y ajustar los correos automáticos que se envían a
          establecimientos y estudiantes. Las partes marcadas como chips se
          completan automáticamente con la información del sistema.
        </p>
      </div>

      <Tabs defaultValue="establecimiento" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="establecimiento">Notificación a establecimiento</TabsTrigger>
          <TabsTrigger value="estudiante">Notificación a estudiante</TabsTrigger>
        </TabsList>

        {/* ESTABLECIMIENTO */}
        <TabsContent value="establecimiento">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Plantilla para establecimientos</CardTitle>
              <CardDescription className="space-y-1">
                <p>
                  Correo que se envía al directivo del colegio con el calendario de
                  prácticas y la nómina de estudiantes adscritos.
                </p>
                <p className="text-xs text-muted-foreground">
                  En la vista previa verás el correo tal como lo recibirá el colegio,
                  con indicaciones entre corchetes que muestran qué datos se rellenan
                  automáticamente.
                </p>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Vista previa amigable */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Vista de ejemplo del correo (lectura para secretaria)
                </h3>
                <div className="rounded-md border bg-background px-4 py-3 text-sm leading-relaxed">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html:
                        buildReadablePreview(
                          establishmentTemplate,
                          "establecimiento"
                        ) ||
                        "<p class='text-muted-foreground'>No hay contenido para mostrar.</p>",
                    }}
                  />
                </div>
              </div>

              {/* Editor técnico */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Código HTML de la plantilla (solo si necesitas ajustes técnicos)
                </h3>
                <EditableHtmlDisplay
                  initialHtml={establishmentTemplate}
                  onHtmlChange={setEstablishmentTemplate}
                  editable={true}
                  className="w-full min-h-[320px] max-h-[60vh] overflow-y-auto rounded-md border bg-muted/30 font-mono text-xs"
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button
                onClick={() => handleSave("establishment")}
                disabled={isSaving === "establishment"}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving === "establishment" ? "Guardando..." : "Guardar plantilla"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ESTUDIANTE */}
        <TabsContent value="estudiante">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Plantilla para estudiantes</CardTitle>
              <CardDescription className="space-y-1">
                <p>
                  Correo que se envía a cada estudiante con el establecimiento asignado,
                  el nivel de práctica y las fechas correspondientes.
                </p>
                <p className="text-xs text-muted-foreground">
                  En la vista previa se muestran etiquetas explicativas en lugar de
                  las variables técnicas, para que sea más fácil entender el contenido.
                </p>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Vista previa amigable */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Vista de ejemplo del correo al estudiante
                </h3>
                <div className="rounded-md border bg-background px-4 py-3 text-sm leading-relaxed">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html:
                        buildReadablePreview(studentTemplate, "estudiante") ||
                        "<p class='text-muted-foreground'>No hay contenido para mostrar.</p>",
                    }}
                  />
                </div>
              </div>

              {/* Editor técnico */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Código HTML de la plantilla
                </h3>
                <EditableHtmlDisplay
                  initialHtml={studentTemplate}
                  onHtmlChange={setStudentTemplate}
                  editable={true}
                  className="w-full min-h-[320px] max-h-[60vh] overflow-y-auto rounded-md border bg-muted/30 font-mono text-xs"
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button
                onClick={() => handleSave("student")}
                disabled={isSaving === "student"}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving === "student" ? "Guardando..." : "Guardar plantilla"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
