"use client";

import { useState, useEffect } from "react";
import type {
  Estudiante,
  Carrera,
  Comuna,
  Tutor,
  Ficha,
  Establecimiento,
  NivelPractica,
  Cupo,
} from "@/lib/definitions";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  StudentForm,
  type StudentFormValues,
} from "@/components/alumnos/student-form";
import { StudentTable } from "@/components/alumnos/student-table";
import { StudentDetails } from "@/components/alumnos/student-details";
import { PlusCircle, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AlumnosPage() {
  const { toast } = useToast();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [filteredEstudiantes, setFilteredEstudiantes] = useState<Estudiante[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState<Estudiante | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] =
    useState<Estudiante | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Data for forms and details view
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [nivelesPractica, setNivelesPractica] = useState<NivelPractica[]>([]);
  const [cupos, setCupos] = useState<Cupo[]>([]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [
        estudiantesData,
        carrerasData,
        comunasData,
        tutoresData,
        fichasData,
        establecimientosData,
        nivelesData,
        cuposData,
      ] = await Promise.all([
        api.getEstudiantes(),
        api.getCarreras(),
        api.getComunas(),
        api.getTutores(),
        api.getFichas(),
        api.getEstablecimientos(),
        api.getNivelesPractica(),
        api.getCupos(),
      ]);
      setEstudiantes(estudiantesData);
      setFilteredEstudiantes(estudiantesData);
      setCarreras(carrerasData);
      setComunas(comunasData);
      setTutores(tutoresData);
      setFichas(fichasData);
      setEstablecimientos(establecimientosData);
      setNivelesPractica(nivelesData);
      setCupos(cuposData);
    } catch (error) {
      toast({
        title: "Error al cargar datos",
        description:
          "No se pudieron obtener los datos del servidor. Inténtalo de nuevo más tarde.",
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
    const results = estudiantes.filter((estudiante) => {
      const carreraNombre =
        carreras.find((c) => c.id === estudiante.carrera_id)?.nombre || "";

      const fullName = `${estudiante.nombre} ${estudiante.ap_paterno} ${estudiante.ap_materno}`;

      const term = searchTerm.toLowerCase();

      return (
        estudiante.rut.toLowerCase().includes(term) ||
        fullName.toLowerCase().includes(term) ||
        estudiante.email.toLowerCase().includes(term) ||
        carreraNombre.toLowerCase().includes(term)
      );
    });

    setFilteredEstudiantes(results);
  }, [searchTerm, estudiantes, carreras]);

  const handleAddEstudiante = () => {
    setEditingEstudiante(null);
    setIsFormOpen(true);
  };

  const handleEditEstudiante = (estudiante: Estudiante) => {
    setEditingEstudiante(estudiante);
    setIsFormOpen(true);
  };

  const handleViewDetails = (estudiante: Estudiante) => {
    setSelectedStudentForDetails(estudiante);
    setIsDetailsOpen(true);
  };

  const handleDeleteEstudiante = async (estudianteId: number) => {
    try {
      await api.deleteEstudiante(estudianteId);
      await fetchAllData(); // Re-fetch to update the list
      toast({
        title: "Estudiante eliminado",
        description: "El estudiante ha sido eliminado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el estudiante.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitForm = async (data: StudentFormValues) => {
    const payload = {
      ...data,
      carrera_id: Number(data.carrera_id),
      comuna_id: Number(data.comuna_id),
      tutor_id: data.tutor_id ? Number(data.tutor_id) : null,
      cond_especial: data.cond_especial || null,
    };

    try {
      if (editingEstudiante) {
        await api.updateEstudiante(editingEstudiante.id, payload);
        toast({
          title: "Estudiante actualizado",
          description: `El estudiante "${data.nombre}" ha sido actualizado.`,
        });
      } else {
        await api.createEstudiante(payload);
        toast({
          title: "Estudiante creado",
          description: `El estudiante "${data.nombre}" ha sido registrado.`,
        });
      }
      setIsFormOpen(false);
      setEditingEstudiante(null);
      await fetchAllData(); // Re-fetch to update the list
    } catch (error) {
      toast({
        title: `Error al ${editingEstudiante ? "actualizar" : "crear"}`,
        description: "No se pudo guardar el estudiante.",
        variant: "destructive",
      });
    }
  };

  const totalEstudiantes = estudiantes.length;
  const totalFiltrados = filteredEstudiantes.length;

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Gestión de Estudiantes</h1>
          <p className="text-sm text-muted-foreground">
            Administra la información de los estudiantes de forma centralizada.
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>
              {totalEstudiantes} estudiante
              {totalEstudiantes === 1 ? "" : "s"} registrados
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

        <Button onClick={handleAddEstudiante} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar estudiante
        </Button>
      </div>

      {/* Card de listado + búsqueda */}
      <Card className="border shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Listado de estudiantes</CardTitle>
              <CardDescription className="mt-1">
                Busca, visualiza y gestiona los estudiantes registrados en el sistema.
              </CardDescription>
            </div>

            {/* Buscador */}
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, RUT, email o carrera..."
                  className="pl-8 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Puedes combinar criterios, por ejemplo: “Juan Pedagogía Básica”.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            // Skeleton simple en vez de texto plano
            <div className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ) : filteredEstudiantes.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {searchTerm ? "No se encontraron estudiantes." : "Aún no hay estudiantes registrados."}
              </p>
              <p>
                {searchTerm
                  ? "Prueba ajustando tu búsqueda o eliminando filtros."
                  : "Comienza agregando un nuevo estudiante desde el botón superior."}
              </p>
            </div>
          ) : (
            <StudentTable
              estudiantes={filteredEstudiantes}
              carreras={carreras}
              onEdit={handleEditEstudiante}
              onDelete={handleDeleteEstudiante}
              onViewDetails={handleViewDetails}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de formulario */}
      <StudentForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitForm}
        initialData={editingEstudiante}
        carreras={carreras}
        comunas={comunas}
        tutores={tutores}
      />

      {/* Modal de detalles */}
      <StudentDetails
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        student={selectedStudentForDetails}
        carreras={carreras}
        comunas={comunas}
        tutores={tutores}
        fichas={fichas}
        establecimientos={establecimientos}
        cupos={cupos}
        nivelesPractica={nivelesPractica}
      />
    </div>
  );
}
