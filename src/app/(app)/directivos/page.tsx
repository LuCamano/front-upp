"use client";

import { useState, useEffect } from "react";
import type { Directivo, Establecimiento } from "@/lib/definitions";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Users2, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DirectivoForm,
  type DirectivoFormValues,
} from "@/components/directivos/directivo-form";
import { DirectivoTable } from "@/components/directivos/directivo-table";
import { useToast } from "@/hooks/use-toast";

export default function DirectivosPage() {
  const { toast } = useToast();
  const [directivos, setDirectivos] = useState<Directivo[]>([]);
  const [filteredDirectivos, setFilteredDirectivos] = useState<Directivo[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDirectivo, setEditingDirectivo] = useState<Directivo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [directivosData, establecimientosData] = await Promise.all([
        api.getDirectivos(),
        api.getEstablecimientos(),
      ]);
      setDirectivos(directivosData);
      setFilteredDirectivos(directivosData);
      setEstablecimientos(establecimientosData);
    } catch (error) {
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron obtener los directivos y establecimientos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const results = directivos.filter((d) =>
      d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (establecimientos.find((e) => e.id === d.establecimiento_id)?.nombre || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredDirectivos(results);
  }, [searchTerm, directivos, establecimientos]);

  const handleAdd = () => {
    setEditingDirectivo(null);
    setIsFormOpen(true);
  };

  const handleEdit = (directivo: Directivo) => {
    setEditingDirectivo(directivo);
    setIsFormOpen(true);
  };

  const handleDelete = async (directivoId: number) => {
    try {
      await api.deleteDirectivo(directivoId);
      toast({ title: "Directivo eliminado" });
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el directivo.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: DirectivoFormValues) => {
    try {
      if (editingDirectivo) {
        await api.updateDirectivo(editingDirectivo.id, data);
        toast({ title: "Directivo actualizado" });
      } else {
        await api.createDirectivo(data);
        toast({ title: "Directivo creado" });
      }
      setIsFormOpen(false);
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el directivo.",
        variant: "destructive",
      });
    }
  };

  const totalDirectivos = directivos.length;
  const totalEstablecimientos = establecimientos.length;

  return (
    <div className="space-y-6">
      {/* Header de página */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Gestión de directivos</h1>
          <p className="text-sm text-muted-foreground">
            Administra los contactos clave de cada establecimiento para el envío de notificaciones.
          </p>

          {/* Resumen rápido */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <Users2 className="h-3.5 w-3.5" />
              <span>{totalDirectivos} directivo(s) registrados</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <Building2 className="h-3.5 w-3.5" />
              <span>{totalEstablecimientos} establecimiento(s) con contactos</span>
            </span>
          </div>
        </div>

        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar directivo
        </Button>
      </div>

      {/* Card principal */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Listado de directivos</CardTitle>
              <CardDescription>
                Busca, visualiza y gestiona los directivos asociados a cada colegio.
              </CardDescription>
            </div>

            {/* Buscador */}
            <div className="relative mt-2 w-full sm:mt-0 sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, email, cargo o colegio..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ) : (
            <DirectivoTable
              directivos={filteredDirectivos}
              establecimientos={establecimientos}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de creación/edición */}
      <DirectivoForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingDirectivo}
        establecimientos={establecimientos}
      />
    </div>
  );
}
