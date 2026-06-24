"use client";

import { useState, useEffect } from "react";
import type { Tutor } from "@/lib/definitions";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, UserSquare2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TutorForm } from "@/components/tutores/tutor-form";
import { TutorTable } from "@/components/tutores/tutor-table";
import { useToast } from "@/hooks/use-toast";

export default function TutoresPage() {
  const { toast } = useToast();
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [filteredTutores, setFilteredTutores] = useState<Tutor[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTutores = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTutores();
      setTutores(data);
      setFilteredTutores(data);
    } catch (error) {
      toast({
        title: "Error al cargar tutores",
        description:
          "No se pudieron obtener los datos de los tutores del servidor.",
        variant: "destructive",
      });
      setTutores([]);
      setFilteredTutores([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = tutores.filter(
      (tutor) =>
        tutor.nombre.toLowerCase().includes(term) ||
        tutor.email.toLowerCase().includes(term),
    );
    setFilteredTutores(results);
  }, [searchTerm, tutores]);

  const handleAdd = () => {
    setEditingTutor(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setIsFormOpen(true);
  };

  const handleDelete = async (tutorId: number) => {
    try {
      await api.deleteTutor(tutorId);
      toast({
        title: "Tutor eliminado",
        description: "El tutor ha sido eliminado exitosamente.",
      });
      await fetchTutores();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el tutor.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: Omit<Tutor, "id">) => {
    try {
      if (editingTutor) {
        await api.updateTutor(editingTutor.id, data);
        toast({
          title: "Tutor actualizado",
          description: `El tutor "${data.nombre}" ha sido actualizado.`,
        });
      } else {
        await api.createTutor(data);
        toast({
          title: "Tutor creado",
          description: `El tutor "${data.nombre}" ha sido registrado.`,
        });
      }
      setIsFormOpen(false);
      await fetchTutores();
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el tutor.",
        variant: "destructive",
      });
    }
  };

  const totalTutores = tutores.length;
  const totalFiltrados = filteredTutores.length;

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Gestión de Tutores</h1>
          <p className="text-sm text-muted-foreground">
            Administra los tutores académicos que acompañan el proceso de práctica.
          </p>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full border bg-muted/70 px-3 py-1 text-xs text-muted-foreground">
            <UserSquare2 className="h-3.5 w-3.5" />
            <span>
              {totalTutores} tutor
              {totalTutores === 1 ? "" : "es"} registrados
            </span>
            {searchTerm && (
              <>
                <span className="h-3 w-px bg-border" />
                <span>
                  {totalFiltrados} resultado
                  {totalFiltrados === 1 ? "" : "s"} para “{searchTerm}”
                </span>
              </>
            )}
          </div>
        </div>

        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar tutor
        </Button>
      </div>

      {/* Card listado + buscador */}
      <Card className="border shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Listado de tutores</CardTitle>
              <CardDescription className="mt-1">
                Busca, visualiza y gestiona los tutores registrados en el sistema.
              </CardDescription>
            </div>

            {/* Buscador */}
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre o email..."
                  className="pl-8 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Ejemplo: “María Pérez” o “@ucsc.cl”.
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
          ) : filteredTutores.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {searchTerm
                  ? "No se encontraron tutores."
                  : "Aún no hay tutores registrados."}
              </p>
              <p>
                {searchTerm
                  ? "Prueba ajustando tu búsqueda o borrando el texto del buscador."
                  : "Comienza agregando un nuevo tutor desde el botón superior."}
              </p>
            </div>
          ) : (
            <TutorTable tutores={filteredTutores} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>

      <TutorForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingTutor}
      />
    </div>
  );
}
