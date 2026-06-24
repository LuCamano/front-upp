"use client";

import { useState, useEffect } from "react";
import type {
  Establecimiento,
  Comuna,
  Cupo,
  NivelPractica,
  Carrera,
  Directivo,
  Ficha,
} from "@/lib/definitions";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, School, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ColegioTable } from "@/components/colegios/colegio-table";
import {
  ColegioForm,
  type ColegioFormValues,
} from "@/components/colegios/colegio-form";
import { CupoManager } from "@/components/colegios/cupo-manager";
import { DirectivoManager } from "@/components/colegios/directivo-manager";
import {
  DirectivoForm,
  type DirectivoFormValues,
} from "@/components/colegios/directivo-form";
import { useToast } from "@/hooks/use-toast";

export default function ColegiosPage() {
  const { toast } = useToast();
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [filteredEstablecimientos, setFilteredEstablecimientos] = useState<Establecimiento[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [cupos, setCupos] = useState<Cupo[]>([]);
  const [nivelesPractica, setNivelesPractica] = useState<NivelPractica[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [directivos, setDirectivos] = useState<Directivo[]>([]);
  const [fichas, setFichas] = useState<Ficha[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingColegio, setEditingColegio] = useState<Establecimiento | null>(null);

  const [isCupoManagerOpen, setIsCupoManagerOpen] = useState(false);
  const [isDirectivoManagerOpen, setIsDirectivoManagerOpen] = useState(false);
  const [managingFor, setManagingFor] = useState<Establecimiento | null>(null);

  const [isDirectivoFormOpen, setIsDirectivoFormOpen] = useState(false);
  const [editingDirectivo, setEditingDirectivo] = useState<Directivo | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [estabData, comunasData, cuposData, nivelesData, carrerasData, directivosData, fichasData] =
        await Promise.all([
          api.getEstablecimientos(),
          api.getComunas(),
          api.getCupos(),
          api.getNivelesPractica(),
          api.getCarreras(),
          api.getDirectivos(),
          api.getFichas(),
        ]);
      setEstablecimientos(estabData);
      setFilteredEstablecimientos(estabData);
      setComunas(comunasData);
      setCupos(cuposData);
      setNivelesPractica(nivelesData);
      setCarreras(carrerasData);
      setDirectivos(directivosData);
      setFichas(fichasData);
    } catch (error) {
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron obtener los datos de colegios.",
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
    const results = establecimientos.filter((colegio) => {
      const comunaNombre =
        comunas.find((c) => c.id === colegio.comuna_id)?.nombre || "";
      return (
        colegio.nombre.toLowerCase().includes(term) ||
        colegio.rbd.toLowerCase().includes(term) ||
        comunaNombre.toLowerCase().includes(term)
      );
    });
    setFilteredEstablecimientos(results);
  }, [searchTerm, establecimientos, comunas]);

  // Colegio Handlers
  const handleAddColegio = () => {
    setEditingColegio(null);
    setIsFormOpen(true);
  };
  const handleEditColegio = (colegio: Establecimiento) => {
    setEditingColegio(colegio);
    setIsFormOpen(true);
  };
  const handleDeleteColegio = async (colegioId: string) => {
    try {
      await api.deleteEstablecimiento(colegioId);
      toast({ title: "Colegio eliminado" });
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el colegio.",
        variant: "destructive",
      });
    }
  };
  const handleColegioFormSubmit = async (data: ColegioFormValues) => {
    const payload = { ...data, comuna_id: Number(data.comuna_id) };
    try {
      if (editingColegio) {
        await api.updateEstablecimiento(editingColegio.id, payload);
        toast({ title: "Colegio actualizado" });
      } else {
        await api.createEstablecimiento(payload);
        toast({ title: "Colegio creado" });
      }
      setIsFormOpen(false);
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el colegio.",
        variant: "destructive",
      });
    }
  };

  // Cupo Handlers
  const handleManageCupos = (establecimiento: Establecimiento) => {
    setManagingFor(establecimiento);
    setIsCupoManagerOpen(true);
  };
  const handleAddCupo = async (data: { nivel_practica_id: string }) => {
    if (!managingFor) return;
    const payload = {
      establecimiento_id: managingFor.id,
      nivel_practica_id: Number(data.nivel_practica_id),
    };
    try {
      await api.createCupo(payload);
      toast({ title: "Cupo agregado" });
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el cupo.",
        variant: "destructive",
      });
    }
  };
  const handleDeleteCupo = async (cupoId: number) => {
    try {
      await api.deleteCupo(cupoId);
      toast({ title: "Cupo eliminado" });
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cupo. Puede que esté en uso.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteCupoCascading = async (cupoId: number, fichaId: number) => {
    try {
      await api.deleteFicha(fichaId);
      toast({
        title: "Ficha asociada eliminada",
        description: "La ficha del estudiante ha sido eliminada.",
      });
      await api.deleteCupo(cupoId);
      toast({
        title: "Cupo eliminado",
        description: "El cupo ha sido eliminado exitosamente.",
      });
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error en cascada",
        description: "No se pudo completar la eliminación del cupo y su ficha.",
        variant: "destructive",
      });
    }
  };

  // Directivo Handlers
  const handleManageDirectivos = (establecimiento: Establecimiento) => {
    setManagingFor(establecimiento);
    setIsDirectivoManagerOpen(true);
  };
  const handleOpenDirectivoForm = (directivo: Directivo | null) => {
    setEditingDirectivo(directivo);
    setIsDirectivoFormOpen(true);
  };
  const handleDeleteDirectivo = async (directivoId: number) => {
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
  const handleDirectivoFormSubmit = async (data: DirectivoFormValues) => {
    if (!managingFor) return;
    try {
      if (editingDirectivo) {
        await api.updateDirectivo(editingDirectivo.id, {
          ...data,
          establecimiento_id: editingDirectivo.establecimiento_id,
        });
        toast({ title: "Directivo actualizado" });
      } else {
        await api.createDirectivo({ ...data, establecimiento_id: managingFor.id });
        toast({ title: "Directivo creado" });
      }
      setIsDirectivoFormOpen(false);
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el directivo.",
        variant: "destructive",
      });
    }
  };

  const totalColegios = establecimientos.length;
  const totalFiltrados = filteredEstablecimientos.length;
  const totalCupos = cupos.length;
  const totalDirectivos = directivos.length;

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Gestión de Colegios</h1>
          <p className="text-sm text-muted-foreground">
            Administra los colegios, sus directivos y sus cupos disponibles para prácticas.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border bg-muted/70 px-3 py-1 text-muted-foreground">
              <School className="h-3.5 w-3.5" />
              <span>
                {totalColegios} colegio
                {totalColegios === 1 ? "" : "s"} registrados
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {totalCupos} cupo
                {totalCupos === 1 ? "" : "s"} de práctica · {totalDirectivos} directivo
                {totalDirectivos === 1 ? "" : "s"}
              </span>
            </span>
            {searchTerm && (
              <span className="inline-flex items-center rounded-full border bg-muted/40 px-3 py-1 text-muted-foreground">
                {totalFiltrados} resultado
                {totalFiltrados === 1 ? "" : "s"} para “{searchTerm}”
              </span>
            )}
          </div>
        </div>

        <Button onClick={handleAddColegio} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar colegio
        </Button>
      </div>

      {/* Card listado + buscador */}
      <Card className="border shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Listado de colegios</CardTitle>
              <CardDescription className="mt-1">
                Busca, visualiza y gestiona los colegios asociados a la facultad.
              </CardDescription>
            </div>

            {/* Buscador */}
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, RBD o comuna..."
                  className="pl-8 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                También puedes buscar por comuna, por ejemplo: “Concepción”.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            // Skeleton simple
            <div className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ) : filteredEstablecimientos.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {searchTerm
                  ? "No se encontraron colegios."
                  : "Aún no hay colegios registrados."}
              </p>
              <p>
                {searchTerm
                  ? "Prueba ajustando tu búsqueda o quitando el texto del buscador."
                  : "Comienza agregando un nuevo colegio desde el botón superior."}
              </p>
            </div>
          ) : (
            <ColegioTable
              establecimientos={filteredEstablecimientos}
              comunas={comunas}
              cupos={cupos}
              directivos={directivos}
              onEdit={handleEditColegio}
              onDelete={handleDeleteColegio}
              onManageCupos={handleManageCupos}
              onManageDirectivos={handleManageDirectivos}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal colegio */}
      <ColegioForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleColegioFormSubmit}
        initialData={editingColegio}
        comunas={comunas}
      />

      {/* Modal cupos */}
      {managingFor && (
        <CupoManager
          isOpen={isCupoManagerOpen}
          onOpenChange={setIsCupoManagerOpen}
          establecimiento={managingFor}
          cupos={cupos.filter((c) => c.establecimiento_id === managingFor.id)}
          nivelesPractica={nivelesPractica}
          carreras={carreras}
          fichas={fichas}
          onAddCupo={handleAddCupo}
          onDeleteCupo={handleDeleteCupo}
          onDeleteCupoCascading={handleDeleteCupoCascading}
        />
      )}

      {/* Modal directivos */}
      {managingFor && (
        <DirectivoManager
          isOpen={isDirectivoManagerOpen}
          onOpenChange={setIsDirectivoManagerOpen}
          establecimiento={managingFor}
          directivos={directivos.filter(
            (d) => d.establecimiento_id === managingFor.id,
          )}
          onAdd={() => handleOpenDirectivoForm(null)}
          onEdit={handleOpenDirectivoForm}
          onDelete={handleDeleteDirectivo}
        />
      )}

      {/* Form de directivo (modal) */}
      {managingFor && (
        <DirectivoForm
          isOpen={isDirectivoFormOpen}
          onOpenChange={setIsDirectivoFormOpen}
          onSubmit={handleDirectivoFormSubmit}
          initialData={editingDirectivo}
        />
      )}
    </div>
  );
}
