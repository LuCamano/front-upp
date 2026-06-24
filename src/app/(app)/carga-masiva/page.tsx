"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileSpreadsheet, AlertTriangle, Trash2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as api from "@/lib/api";

export default function CargaMasivaPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Archivo no válido",
          description: "Por favor, selecciona un archivo de Excel (.xlsx o .xls).",
          variant: "destructive",
        });
        setSelectedFile(null);
        event.target.value = "";
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No se ha seleccionado un archivo",
        description: "Por favor, selecciona un archivo para subir.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      await api.uploadFile(selectedFile);
      toast({
        title: "Carga exitosa",
        description: `El archivo "${selectedFile.name}" ha sido procesado correctamente.`,
      });
      setSelectedFile(null);
      const input = document.getElementById("excel-upload") as HTMLInputElement;
      if (input) input.value = "";
    } catch (error) {
      toast({
        title: "Error en la carga",
        description: "No se pudo procesar el archivo. Revisa el formato y vuelve a intentarlo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearDatabase = async () => {
    setIsClearing(true);
    try {
      await api.clearDatabase();
      toast({
        title: "Base de datos vaciada",
        description: "Todos los datos han sido eliminados del sistema.",
      });
    } catch (error) {
      toast({
        title: "Error al vaciar la base de datos",
        description: "No se pudo completar la operación.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header de página */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Carga masiva de datos</h1>
          <p className="text-sm text-muted-foreground">
            Sube archivos de Excel para registrar estudiantes, colegios y asignaciones de forma masiva.
          </p>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full border bg-muted/70 px-3 py-1 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            <span>Recomendado: usar siempre la plantilla oficial del sistema.</span>
          </div>
        </div>

        {/* Podrías agregar aquí un botón de descarga de plantilla más adelante */}
      </div>

      {/* Card de carga de archivo */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Subir archivo Excel</CardTitle>
          <CardDescription>
            Selecciona el archivo de Excel que deseas procesar. Asegúrate de que siga la plantilla y el
            formato correctos antes de iniciar la carga.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Zona de drop / selección */}
          <Label htmlFor="excel-upload" className="block w-full cursor-pointer">
            <div className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/40 p-8 text-center transition-colors hover:border-primary hover:bg-muted/60">
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                Arrastra y suelta un archivo o haz clic para seleccionarlo
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">Formatos soportados: .xlsx, .xls</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Verifica que las columnas coincidan con la plantilla entregada por la unidad.
              </p>

              <Input
                id="excel-upload"
                type="file"
                className="sr-only"
                accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              <Button asChild variant="outline" className="pointer-events-none mt-4">
                <span>Seleccionar archivo</span>
              </Button>
            </div>
          </Label>

          {/* Resumen del archivo seleccionado */}
          {selectedFile && (
            <div className="rounded-md bg-muted/60 p-4">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Archivo seleccionado</p>
                  <p className="text-sm text-muted-foreground break-all">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Tamaño: {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botón de carga */}
          <div className="flex justify-end">
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? "Subiendo..." : "Iniciar carga"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zona peligrosa */}
      <Card className="border border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zona peligrosa
          </CardTitle>
          <CardDescription className="text-sm">
            Las siguientes acciones son irreversibles. Procede solo si estás completamente seguro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 rounded-md bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">Vaciar base de datos</h4>
              <p className="text-xs text-muted-foreground">
                Esta acción eliminará permanentemente todos los datos, incluyendo alumnos, colegios,
                asignaciones y configuraciones relacionadas con la práctica.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                  disabled={isClearing}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isClearing ? "Vaciando..." : "Vaciar base de datos"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos de
                    la base de datos. Toda la información de alumnos, colegios, asignaciones y
                    configuraciones se perderá para siempre.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearDatabase}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isClearing}
                  >
                    {isClearing ? "Vaciando..." : "Sí, vaciar todo"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
