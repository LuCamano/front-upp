"use client";

import { useState, useEffect } from "react";
import type { Carrera, NivelPractica } from "@/lib/definitions";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, GraduationCap, Layers3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CarreraForm } from "@/components/carreras/carrera-form";
import { CarreraTable } from "@/components/carreras/carrera-table";
import { NivelPracticaManager } from "@/components/carreras/nivel-practica-manager";
import { useToast } from "@/hooks/use-toast";

export default function CarrerasPage() {
  const { toast } = useToast();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [filteredCarreras, setFilteredCarreras] = useState<Carrera[]>([]);
  const [nivelesPractica, setNivelesPractica] = useState<NivelPractica[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCarrera, setEditingCarrera] = useState<Carrera | null>(null);

  const [isNivelManagerOpen, setIsNivelManagerOpen] = useState(false);
  const [managingNivelesFor, setManagingNivelesFor] = useState<Carrera | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [carrerasData, nivelesData] = await Promise.all([
        api.getCarreras(),
        api.getNivelesPractica(),
      ]);
      setCarreras(carrerasData);
      setFilteredCarreras(carrerasData);
      setNivelesPractica(nivelesData);
    } catch (error) {
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron obtener carreras y niveles de práctica.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = carreras.filter((carrera) =>
      carrera.nombre.toLowerCase().includes(term),
    );
    setFilteredCarreras(results);
  }, [searchTerm, carreras]);

  const handleAdd = () => {
    setEditingCarrera(null);
    setIsFormOpen(true);
  };

  const handleEdit = (carrera: Carrera) => {
    setEditingCarrera(carrera);
    setIsFormOpen(true);
  };

  const handleDelete = async (carreraId: number) => {
    try {
      await api.deleteCarrera(carreraId);
      toast({
        title: "Carrera eliminada",
        description: "La carrera ha sido eliminada.",
      });
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la carrera.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: { nombre: string }) => {
    try {
      if (editingCarrera) {
        await api.updateCarrera(editingCarrera.id, data);
        toast({
          title: "Carrera actualizada",
          description: `La carrera "${data.nombre}" ha sido actualizada.`,
        });
      } else {
        await api.createCarrera(data);
        toast({
          title: "Carrera creada",
          description: `La carrera "${data.nombre}" ha sido registrada.`,
        });
      }
      setIsFormOpen(false);
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la carrera.",
        variant: "destructive",
      });
    }
  };

  const handleManageNiveles = (carrera: Carrera) => {
    setManagingNivelesFor(carrera);
    setIsNivelManagerOpen(true);
  };

  const handleAddNivel = async (data: { nombre: string }) => {
    if (!managingNivelesFor) return;
    try {
      await api.createNivelPractica({ ...data, carrera_id: managingNivelesFor.id });
      toast({
        title: "Nivel de práctica agregado",
        description: `Se ha añadido "${data.nombre}".`,
      });
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el nivel.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNivel = async (nivelId: number) => {
    try {
      await api.deleteNivelPractica(nivelId);
      toast({ title: "Nivel de práctica eliminado" });
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el nivel.",
        variant: "destructive",
      });
    }
  };

  const totalCarreras = carreras.length;
  const totalNiveles = nivelesPractica.length;
  const totalFiltradas = filteredCarreras.length;

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Gestión de Carreras</h1>
          <p className="text-sm text-muted-foreground">
            Administra las carreras y sus niveles de práctica asociados.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border bg-muted/70 px-3 py-1 text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>
                {totalCarreras} carrera
                {totalCarreras === 1 ? "" : "s"} registradas
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5" />
              <span>
                {totalNiveles} nivel
                {totalNiveles === 1 ? "" : "es"} de práctica
              </span>
            </span>
            {searchTerm && (
              <span className="inline-flex items-center rounded-full border bg-muted/40 px-3 py-1 text-muted-foreground">
                {totalFiltradas} resultado
                {totalFiltradas === 1 ? "" : "s"} para “{searchTerm}”
              </span>
            )}
          </div>
        </div>

        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar carrera
        </Button>
      </div>

      {/* Card listado + buscador */}
      <Card className="border shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Listado de carreras</CardTitle>
              <CardDescription className="mt-1">
                Busca, visualiza y gestiona las carreras y sus niveles de práctica.
              </CardDescription>
            </div>

            {/* Buscador */}
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre..."
                  className="pl-8 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Ejemplo: “Pedagogía en Educación Básica”.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            // Skeleton mientras carga
            <div className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ) : filteredCarreras.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {searchTerm
                  ? "No se encontraron carreras."
                  : "Aún no hay carreras registradas."}
              </p>
              <p>
                {searchTerm
                  ? "Prueba ajustando tu búsqueda o borrando el texto del buscador."
                  : "Comienza agregando una nueva carrera desde el botón superior."}
              </p>
            </div>
          ) : (
            <CarreraTable
              carreras={filteredCarreras}
              nivelesPractica={nivelesPractica}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageNiveles={handleManageNiveles}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal carrera */}
      <CarreraForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingCarrera}
      />

      {/* Modal niveles */}
      {managingNivelesFor && (
        <NivelPracticaManager
          isOpen={isNivelManagerOpen}
          onOpenChange={setIsNivelManagerOpen}
          carrera={managingNivelesFor}
          niveles={nivelesPractica.filter(
            (n) => n.carrera_id === managingNivelesFor.id,
          )}
          onAddNivel={handleAddNivel}
          onDeleteNivel={handleDeleteNivel}
        />
      )}
    </div>
  );
}
