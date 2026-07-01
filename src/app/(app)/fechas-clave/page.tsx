
"use client";

import { useState, useEffect } from "react";
import type { FechaClave } from "@/lib/definitions";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FechaClaveForm } from "@/components/fechas-clave/fecha-clave-form";
import { FechaClaveTable } from "@/components/fechas-clave/fecha-clave-table";
import { useToast } from "@/hooks/use-toast";

export default function FechasClavePage() {
  const { toast } = useToast();
  const [fechas, setFechas] = useState<FechaClave[]>([]);
  const [filteredFechas, setFilteredFechas] = useState<FechaClave[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFecha, setEditingFecha] = useState<FechaClave | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchFechas = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFechasClave();
      setFechas(data);
      setFilteredFechas(data);
    } catch (error) {
      toast({
        title: "Error al cargar fechas",
        description: "No se pudieron obtener los datos de las fechas clave.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFechas();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = fechas.filter((f) =>
      f.nombre.toLowerCase().includes(term) ||
      (f.descripcion?.toLowerCase().includes(term) || false)
    );
    setFilteredFechas(results);
  }, [searchTerm, fechas]);

  const handleAdd = () => {
    setEditingFecha(null);
    setIsFormOpen(true);
  };

  const handleEdit = (fecha: FechaClave) => {
    setEditingFecha(fecha);
    setIsFormOpen(true);
  };

  const handleDelete = async (nombre: string) => {
    try {
      await api.deleteFechaClave(nombre);
      toast({ title: "Fecha clave eliminada" });
      await fetchFechas();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la fecha clave.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: FechaClave) => {
    try {
      if (editingFecha) {
        await api.updateFechaClave(editingFecha.nombre, data);
        toast({ title: "Fecha clave actualizada" });
      } else {
        await api.createFechaClave(data);
        toast({ title: "Fecha clave creada" });
      }
      setIsFormOpen(false);
      await fetchFechas();
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la fecha clave.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Gestión de Fechas Clave</h1>
          <p className="text-sm text-muted-foreground">
            Administra las fechas del calendario académico que se utilizarán para pre-poblar los procesos de asignación.
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border bg-muted/70 px-3 py-1 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>{fechas.length} fecha(s) registradas</span>
          </div>
        </div>

        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar fecha
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Listado de fechas clave</CardTitle>
              <CardDescription className="mt-1">
                Utiliza nombres estandarizados para que el sistema las reconozca automáticamente en la asignación.
              </CardDescription>
            </div>

            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre o descripción..."
                  className="pl-8 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ) : filteredFechas.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No se encontraron fechas clave.</p>
              <p>Comienza agregando una nueva fecha desde el botón superior.</p>
            </div>
          ) : (
            <FechaClaveTable
              fechas={filteredFechas}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <FechaClaveForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingFecha}
      />
    </div>
  );
}
