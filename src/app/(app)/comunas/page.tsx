"use client";

import { useState, useEffect } from "react";
import type { Comuna } from "@/lib/definitions";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ComunaForm } from "@/components/comunas/comuna-form";
import { ComunaTable } from "@/components/comunas/comuna-table";
import { useToast } from "@/hooks/use-toast";

export default function ComunasPage() {
  const { toast } = useToast();
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [filteredComunas, setFilteredComunas] = useState<Comuna[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComuna, setEditingComuna] = useState<Comuna | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchComunas = async () => {
    setIsLoading(true);
    try {
      const data = await api.getComunas();
      setComunas(data);
      setFilteredComunas(data);
    } catch (error) {
      toast({
        title: "Error al cargar comunas",
        description: "No se pudieron obtener los datos de las comunas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComunas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = comunas.filter((comuna) =>
      comuna.nombre.toLowerCase().includes(term),
    );
    setFilteredComunas(results);
  }, [searchTerm, comunas]);

  const handleAdd = () => {
    setEditingComuna(null);
    setIsFormOpen(true);
  };

  const handleEdit = (comuna: Comuna) => {
    setEditingComuna(comuna);
    setIsFormOpen(true);
  };

  const handleDelete = async (comunaId: number) => {
    try {
      await api.deleteComuna(comunaId);
      toast({ title: "Comuna eliminada" });
      await fetchComunas();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la comuna.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: { nombre: string }) => {
    try {
      if (editingComuna) {
        await api.updateComuna(editingComuna.id, data);
        toast({ title: "Comuna actualizada" });
      } else {
        await api.createComuna(data);
        toast({ title: "Comuna creada" });
      }
      setIsFormOpen(false);
      await fetchComunas();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la comuna.",
        variant: "destructive",
      });
    }
  };

  const totalComunas = comunas.length;
  const totalFiltradas = filteredComunas.length;

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Gestión de Comunas</h1>
          <p className="text-sm text-muted-foreground">
            Administra las comunas disponibles en el sistema para asociarlas a colegios y estudiantes.
          </p>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full border bg-muted/70 px-3 py-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {totalComunas} comuna
              {totalComunas === 1 ? "" : "s"} registrada
            </span>
            {searchTerm && (
              <>
                <span className="h-3 w-px bg-border" />
                <span>
                  {totalFiltradas} resultado
                  {totalFiltradas === 1 ? "" : "s"} para “{searchTerm}”
                </span>
              </>
            )}
          </div>
        </div>

        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar comuna
        </Button>
      </div>

      {/* Card listado + buscador */}
      <Card className="border shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Listado de comunas</CardTitle>
              <CardDescription className="mt-1">
                Busca, visualiza y gestiona las comunas registradas en el sistema.
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
                Ejemplo: “Concepción”, “San Pedro de la Paz”.
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
          ) : filteredComunas.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {searchTerm
                  ? "No se encontraron comunas."
                  : "Aún no hay comunas registradas."}
              </p>
              <p>
                {searchTerm
                  ? "Prueba ajustando tu búsqueda o borrando el texto del buscador."
                  : "Comienza agregando una nueva comuna desde el botón superior."}
              </p>
            </div>
          ) : (
            <ComunaTable
              comunas={filteredComunas}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de comuna */}
      <ComunaForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingComuna}
      />
    </div>
  );
}
