"use client";

import { useState, useEffect, useMemo } from "react";
import type {
  Estudiante,
  Establecimiento,
  Carrera,
  Directivo,
  Comuna,
  Cupo,
  NivelPractica,
  Ficha,
  EmailSchema,
  SendEmailToEstablecimientoPayload,
} from "@/lib/definitions";
import * as api from "@/lib/api";
import { format, parseISO, differenceInWeeks } from "date-fns";
import { es } from "date-fns/locale/es";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  Search,
  PlusCircle,
  Trash2,
  ChevronRight,
  Mail,
  Send,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { EditableHtmlDisplay } from "@/components/shared/editable-html-display";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const ADSCRIPCION_STEPS = {
  STEP1: "seleccion-estudiantes",
  STEP2: "notificacion-establecimiento",
  STEP3: "notificacion-estudiantes",
} as const;

// Helper para acceder propiedades anidadas
const get = (obj: any, path: string, defaultValue: any = undefined) => {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

export default function AdscripcionPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [availableStudents, setAvailableStudents] = useState<Estudiante[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Estudiante[]>([]);

  const [allStudents, setAllStudents] = useState<Estudiante[]>([]);
  const [allEstablecimientos, setAllEstablecimientos] = useState<Establecimiento[]>([]);
  const [allCarreras, setAllCarreras] = useState<Carrera[]>([]);
  const [allDirectivos, setAllDirectivos] = useState<Directivo[]>([]);
  const [allComunas, setAllComunas] = useState<Comuna[]>([]);
  const [allCupos, setAllCupos] = useState<Cupo[]>([]);
  const [allFichas, setAllFichas] = useState<Ficha[]>([]);
  const [allNivelesPractica, setAllNivelesPractica] = useState<NivelPractica[]>([]);
  const [createdFichas, setCreatedFichas] = useState<Ficha[]>([]);

  const [selectedEstablecimientoId, setSelectedEstablecimientoId] = useState<string | null>(null);
  const [studentCupoAssignments, setStudentCupoAssignments] = useState<Record<number, number | null>>(
    {}
  );

  const [establishmentTemplate, setEstablishmentTemplate] = useState<string>("");
  const [studentTemplate, setStudentTemplate] = useState<string>("");
  const [renderedEmail, setRenderedEmail] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingFichas, setIsCreatingFichas] = useState(false);

  // Step 2
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Step 3
  const [studentsGroupedByLevel, setStudentsGroupedByLevel] = useState<
    Record<string, { nivel: NivelPractica; students: Estudiante[] }>
  >({});
  const [scheduledSendTimes, setScheduledSendTimes] = useState<Record<string, string>>({});
  const [previewStudent, setPreviewStudent] = useState<Estudiante | null>(null);
  const [renderedStudentEmail, setRenderedStudentEmail] = useState<string>("");
  const [isUpdatingAndSending, setIsUpdatingAndSending] = useState(false);
  const [studentEmailsSent, setStudentEmailsSent] = useState(false);

  const [professionalDates, setProfessionalDates] = useState({ inicio: "", termino: "" });
  const [pedagogicalDates, setPedagogicalDates] = useState({ inicio: "", termino: "" });

  const [currentStep, setCurrentStep] = useState<string>(ADSCRIPCION_STEPS.STEP1);
  const [unlockedSteps, setUnlockedSteps] = useState<string[]>([ADSCRIPCION_STEPS.STEP1]);

  const [comboboxOpen, setComboboxOpen] = useState(false);

  const selectedEstablecimiento = useMemo(
    () => allEstablecimientos.find((c) => c.id === selectedEstablecimientoId) || null,
    [selectedEstablecimientoId, allEstablecimientos]
  );

  const selectedDirectivo = useMemo(() => {
    if (!selectedEstablecimiento) return null;
    return allDirectivos.find((d) => d.establecimiento_id === selectedEstablecimiento.id) || null;
  }, [selectedEstablecimiento, allDirectivos]);

  const getCarreraName = (carreraId: number) =>
    allCarreras.find((c) => c.id === carreraId)?.nombre || "N/A";
  const getComunaName = (comunaId: number) =>
    allComunas.find((c) => c.id === comunaId)?.nombre || "N/A";
  const getNivelName = (nivelId: number) =>
    allNivelesPractica.find((n) => n.id === nivelId)?.nombre || "N/A";

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [
          studentsData,
          establecimientosData,
          carrerasData,
          directivosData,
          comunasData,
          cuposData,
          nivelesData,
          estTemplateData,
          stuTemplateData,
          fichasData,
        ] = await Promise.all([
          api.getEstudiantes(),
          api.getEstablecimientos(),
          api.getCarreras(),
          api.getDirectivos(),
          api.getComunas(),
          api.getCupos(),
          api.getNivelesPractica(),
          api.getEstablishmentEmailTemplate(),
          api.getStudentEmailTemplate(),
          api.getFichas(),
        ]);
        setAllStudents(studentsData);
        setAvailableStudents(studentsData);
        setAllEstablecimientos(establecimientosData);
        setAllCarreras(carrerasData);
        setAllDirectivos(directivosData);
        setAllComunas(comunasData);
        setAllCupos(cuposData);
        setAllNivelesPractica(nivelesData);
        setEstablishmentTemplate(estTemplateData || "");
        setStudentTemplate(stuTemplateData || "");
        setAllFichas(fichasData);
      } catch (error) {
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron obtener los datos para el proceso de adscripción.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [toast]);

  useEffect(() => {
    if (currentStep === ADSCRIPCION_STEPS.STEP3 && createdFichas.length > 0) {
      const grouped: Record<string, { nivel: NivelPractica; students: Estudiante[] }> = {};

      for (const ficha of createdFichas) {
        const student = allStudents.find((s) => s.id === ficha.estudiante_id);
        if (!student) continue;

        const cupo = allCupos.find((c) => c.id === ficha.cupo_id);
        if (!cupo) continue;

        const nivel = allNivelesPractica.find((n) => n.id === cupo.nivel_practica_id);
        if (!nivel) continue;

        if (!grouped[nivel.id]) {
          grouped[nivel.id] = { nivel, students: [] };
        }
        grouped[nivel.id].students.push(student);
      }
      setStudentsGroupedByLevel(grouped);
    }
  }, [currentStep, createdFichas, allStudents, allCupos, allNivelesPractica]);

  useEffect(() => {
    if (!previewStudent || !studentTemplate || !selectedEstablecimiento || !selectedDirectivo) {
      setRenderedStudentEmail(
        "<p class='text-muted-foreground p-4 text-center'>Seleccione un estudiante para previsualizar el correo.</p>"
      );
      return;
    }

    const ficha = createdFichas.find((f) => f.estudiante_id === previewStudent.id);
    if (!ficha) return;

    const cupo = allCupos.find((c) => c.id === ficha.cupo_id);
    const nivel = allNivelesPractica.find((n) => n.id === cupo?.nivel_practica_id);

    const templateData = {
      estudiante: previewStudent,
      nombre_establecimiento: selectedEstablecimiento.nombre,
      nivel_practica: nivel?.nombre || "N/A",
      semana_inicio: ficha.fecha_inicio
        ? format(parseISO(ficha.fecha_inicio), "dd 'de' MMMM, yyyy", { locale: es })
        : "N/A",
      semana_termino: ficha.fecha_termino
        ? format(parseISO(ficha.fecha_termino), "dd 'de' MMMM, yyyy", { locale: es })
        : "N/A",
      directivo: selectedDirectivo,
    };

    const rendered = renderTemplate(studentTemplate, templateData);
    setRenderedStudentEmail(rendered);
  }, [
    previewStudent,
    studentTemplate,
    createdFichas,
    allCupos,
    allNivelesPractica,
    selectedEstablecimiento,
    selectedDirectivo,
  ]);

  const renderTemplate = (template: string, data: Record<string, any>): string => {
    if (!template) return "";

    const processContent = (content: string, contextData: Record<string, any>): string => {
      let loopResolvedContent = content;

      const loopRegex =
        /\{%\s*for\s+(\w+)\s+in\s+([\w\.]+)\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/g;
      loopResolvedContent = loopResolvedContent.replace(
        loopRegex,
        (match, itemName, collectionPath, innerContent) => {
          const collection = get(contextData, collectionPath.trim());
          if (Array.isArray(collection)) {
            return collection
              .map((item) => {
                const newContext = { ...contextData, [itemName]: item };
                return processContent(innerContent, newContext);
              })
              .join("");
          }
          return "";
        }
      );

      const varRegex = /\{\{\s*([\w\._]+)\s*\}\}/g;
      return loopResolvedContent.replace(varRegex, (match, path) => {
        const value = get(contextData, path.trim());

        if (value === undefined || value === null) {
          return "";
        }

        if (
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z)?)?$/.test(value)
        ) {
          try {
            return format(parseISO(value), "dd 'de' MMMM, yyyy", { locale: es });
          } catch (e) {
            /* ignore */
          }
        }

        if (typeof value === "object") {
          return "";
        }

        return String(value);
      });
    };

    return processContent(template, data);
  };

  const calculateWeeks = (start: string, end: string) => {
    if (!start || !end) return 0;
    try {
      const startDate = parseISO(start);
      const endDate = parseISO(end);
      return differenceInWeeks(endDate, startDate);
    } catch (e) {
      return 0;
    }
  };

  useEffect(() => {
  if (!selectedEstablecimiento || !selectedDirectivo) {
    setRenderedEmail(
      "<p class='text-muted-foreground p-4 text-center'>Por favor, selecciona un establecimiento para generar la previsualización del correo.</p>"
    );
    return;
  }

  const fichasForTemplate = createdFichas.map((ficha) => {
    const student = allStudents.find((s) => s.id === ficha.estudiante_id);
    const cupo = allCupos.find((c) => c.id === ficha.cupo_id);
    const nivel = allNivelesPractica.find((n) => n.id === cupo?.nivel_practica_id);

    return {
      ...ficha,
      estudiante: student
        ? {
            ...student,
            carrera: getCarreraName(student.carrera_id),
          }
        : {},
      nivel_practica: nivel?.nombre || "",
    };
  });

  const templateData = {
    directivo: selectedDirectivo,
    establecimiento: selectedEstablecimiento,
    semana_inicio_profesional: professionalDates.inicio
      ? format(parseISO(professionalDates.inicio), "dd 'de' MMMM", { locale: es })
      : "N/A",
    semana_termino_profesional: professionalDates.termino
      ? format(parseISO(professionalDates.termino), "dd 'de' MMMM", { locale: es })
      : "N/A",
    numero_semanas_profesional: calculateWeeks(
      professionalDates.inicio,
      professionalDates.termino
    ),
    semana_inicio_pp: pedagogicalDates.inicio
      ? format(parseISO(pedagogicalDates.inicio), "dd 'de' MMMM", { locale: es })
      : "N/A",
    semana_termino_pp: pedagogicalDates.termino
      ? format(parseISO(pedagogicalDates.termino), "dd 'de' MMMM", { locale: es })
      : "N/A",
    numero_semanas_pp: calculateWeeks(pedagogicalDates.inicio, pedagogicalDates.termino),
    fichas: fichasForTemplate,
  };

  const rendered = renderTemplate(establishmentTemplate, templateData);
    setRenderedEmail(rendered);
  }, [
    selectedEstablecimiento,
    selectedDirectivo,
    establishmentTemplate,
    professionalDates,
    pedagogicalDates,
    createdFichas,
    allStudents,
    allCupos,
    allNivelesPractica,
    allCarreras,
  ]);

  const filteredAvailableStudents = useMemo(() => {
    if (!searchTerm) {
      return availableStudents;
    }
    return availableStudents.filter(
      (student) =>
        student.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${student.nombre} ${student.ap_paterno} ${student.ap_materno}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCarreraName(student.carrera_id).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, availableStudents, allCarreras]);

  const handleAddStudent = (studentToAdd: Estudiante) => {
    setSelectedStudents((prevSelected) => [...prevSelected, studentToAdd]);
    setAvailableStudents((prevAvailable) =>
      prevAvailable.filter((s) => s.id !== studentToAdd.id)
    );
    setStudentCupoAssignments((prev) => ({ ...prev, [studentToAdd.id]: null }));
  };

  const handleRemoveStudent = (studentToRemove: Estudiante) => {
    setAvailableStudents((prevAvailable) => [...prevAvailable, studentToRemove]);
    setSelectedStudents((prevSelected) =>
      prevSelected.filter((s) => s.id !== studentToRemove.id)
    );
    setStudentCupoAssignments((prev) => {
      const newAssignments = { ...prev };
      delete newAssignments[studentToRemove.id];
      return newAssignments;
    });
  };

  const getAvailableCuposForStudent = (student: Estudiante) => {
    if (!selectedEstablecimientoId) return [];

    const cuposOcupadosEnDB = allFichas.map((f) => f.cupo_id);
    const cuposOcupadosEnUI = Object.values(studentCupoAssignments).filter(
      (cupoId) => cupoId !== null && cupoId !== studentCupoAssignments[student.id]
    );

    const cuposOcupados = new Set([...cuposOcupadosEnDB, ...cuposOcupadosEnUI]);

    const nivelesForCarrera = allNivelesPractica.filter(
      (n) => n.carrera_id === student.carrera_id
    );
    const nivelIds = nivelesForCarrera.map((n) => n.id);

    return allCupos.filter(
      (cupo) =>
        cupo.establecimiento_id === selectedEstablecimientoId &&
        nivelIds.includes(cupo.nivel_practica_id) &&
        !cuposOcupados.has(cupo.id)
    );
  };

  const handleCupoAssignmentChange = (studentId: number, cupoId: string) => {
    setStudentCupoAssignments((prev) => ({ ...prev, [studentId]: Number(cupoId) }));
  };

  const isStep1Valid =
    selectedStudents.length > 0 &&
    selectedEstablecimientoId !== null &&
    professionalDates.inicio &&
    professionalDates.termino &&
    pedagogicalDates.inicio &&
    pedagogicalDates.termino &&
    selectedStudents.every((s) => studentCupoAssignments[s.id]);

  const isStep2Valid = selectedEstablecimientoId !== null && createdFichas.length > 0;
  const isStep3Valid =
    createdFichas.length > 0 &&
    Object.keys(studentsGroupedByLevel).every((nivelId) => scheduledSendTimes[nivelId]);

  const handleCreateFichas = async (): Promise<Ficha[] | null> => {
    if (!isStep1Valid) {
      toast({
        title: "Información incompleta",
        description:
          "Asegúrate de haber seleccionado un establecimiento, las fechas y de haber asignado un cupo a cada estudiante.",
        variant: "destructive",
      });
      return null;
    }

    const fichaCreationPromises: Promise<Ficha>[] = [];

    for (const student of selectedStudents) {
      const cupoId = studentCupoAssignments[student.id];
      if (!cupoId) continue;

      const cupo = allCupos.find((c) => c.id === cupoId);
      if (!cupo) continue;

      const nivelPractica = allNivelesPractica.find((n) => n.id === cupo.nivel_practica_id);
      if (!nivelPractica) continue;

      const isProfessional = nivelPractica.nombre.toLowerCase().includes("profesional");
      const dates = isProfessional ? professionalDates : pedagogicalDates;

      const fichaPayload = {
        estudiante_id: student.id,
        establecimiento_id: selectedEstablecimientoId!,
        cupo_id: cupo.id,
        fecha_inicio: dates.inicio,
        fecha_termino: dates.termino,
        fecha_envio: new Date().toISOString(),
      };

      fichaCreationPromises.push(api.createFicha(fichaPayload));
    }

    try {
      const newFichas = await Promise.all(fichaCreationPromises);
      setCreatedFichas(newFichas);
      toast({
        title: "Fichas creadas correctamente",
        description: `Se han creado ${newFichas.length} fichas de práctica.`,
      });
      return newFichas;
    } catch (error) {
      toast({
        title: "Error al crear fichas",
        description: "Ocurrió un error al intentar registrar las fichas en el sistema.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSendNotification = async () => {
    if (!selectedEstablecimiento || !selectedDirectivo) {
      toast({
        title: "Información incompleta",
        description:
          "No se ha seleccionado un establecimiento o no se encontró un directivo asociado.",
        variant: "destructive",
      });
      return;
    }

    if (createdFichas.length === 0) {
      toast({
        title: "No hay fichas para enviar",
        description:
          "No se encontraron fichas creadas en este proceso. Vuelve al paso 1 e inténtalo de nuevo.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);

    const emailPayload: SendEmailToEstablecimientoPayload = {
      email: {
        subject: `Notificación de adscripción de prácticas - ${selectedEstablecimiento.nombre}`,
        email: [selectedDirectivo.email],
      },
      body: {
        directivo: selectedDirectivo,
        establecimiento: selectedEstablecimiento,
        fichas: createdFichas,
        semana_inicio_profesional: professionalDates.inicio
          ? format(parseISO(professionalDates.inicio), "dd 'de' MMMM", { locale: es })
          : "N/A",
        semana_termino_profesional: professionalDates.termino
          ? format(parseISO(professionalDates.termino), "dd 'de' MMMM", { locale: es })
          : "N/A",
        numero_semanas_profesional: calculateWeeks(
          professionalDates.inicio,
          professionalDates.termino
        ),
        semana_inicio_pp: pedagogicalDates.inicio
          ? format(parseISO(pedagogicalDates.inicio), "dd 'de' MMMM", { locale: es })
          : "N/A",
        semana_termino_pp: pedagogicalDates.termino
          ? format(parseISO(pedagogicalDates.termino), "dd 'de' MMMM", { locale: es })
          : "N/A",
        numero_semanas_pp: calculateWeeks(pedagogicalDates.inicio, pedagogicalDates.termino),
      },
    };

    try {
      await api.sendEmailToEstablecimiento(selectedEstablecimiento.id, emailPayload);
      toast({
        title: "Notificación enviada",
        description: `El correo ha sido enviado a ${selectedDirectivo.email}.`,
      });
      setEmailSent(true);
    } catch (error) {
      toast({
        title: "Error al enviar notificación",
        description: "No se pudo enviar el correo. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleUpdateAndSendStudentEmails = async () => {
    const allDatesSet = Object.keys(studentsGroupedByLevel).every(
      (nivelId) => scheduledSendTimes[nivelId]
    );
    if (!allDatesSet) {
      toast({
        title: "Fechas incompletas",
        description: "Define una fecha y hora de envío para cada grupo de práctica.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingAndSending(true);

    try {
      const updatePromises = createdFichas.map((ficha) => {
        const cupo = allCupos.find((c) => c.id === ficha.cupo_id);
        const nivelId = cupo!.nivel_practica_id;
        const fecha_envio = new Date(scheduledSendTimes[nivelId]).toISOString();

        const fichaPayload: Omit<Ficha, "id"> = {
          estudiante_id: ficha.estudiante_id,
          establecimiento_id: ficha.establecimiento_id,
          cupo_id: ficha.cupo_id,
          fecha_inicio: ficha.fecha_inicio,
          fecha_termino: ficha.fecha_termino,
          fecha_envio: fecha_envio,
        };

        return api.updateFicha(ficha.id, fichaPayload);
      });

      await Promise.all(updatePromises);
      toast({
        title: "Fichas actualizadas",
        description: "Las fechas de envío han sido guardadas correctamente.",
      });

      const sendPromises = createdFichas.map(async (ficha) => {
        const student = allStudents.find((s) => s.id === ficha.estudiante_id);
        if (!student) return Promise.resolve();

        const emailPayload: EmailSchema = {
          subject: `Detalles de tu práctica - ${selectedEstablecimiento?.nombre || "UCSC"}`,
          email: [student.email],
        };
        return api.sendEmailToStudent(ficha.id, emailPayload);
      });

      await Promise.all(sendPromises);

      toast({
        title: "Correos enviados",
        description: "Los correos a los estudiantes han sido procesados y/o programados.",
      });
      setStudentEmailsSent(true);
    } catch (error) {
      console.error("Error updating/sending student emails:", error);
      toast({
        title: "Error en el envío",
        description: "No se pudieron actualizar las fichas o enviar los correos.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAndSending(false);
    }
  };

  const goToNextStep = async (nextStep: string) => {
    if (currentStep === ADSCRIPCION_STEPS.STEP1) {
      setIsCreatingFichas(true);
      const newFichas = await handleCreateFichas();
      setIsCreatingFichas(false);
      if (!newFichas || newFichas.length === 0) {
        return;
      }
    }
    setUnlockedSteps((prev) => [...new Set([...prev, nextStep])]);
    setCurrentStep(nextStep);
  };

  const handleTabChange = (newStep: string) => {
    if (unlockedSteps.includes(newStep)) {
      setCurrentStep(newStep);
    }
  };

  const step1Completed = unlockedSteps.includes(ADSCRIPCION_STEPS.STEP2);
  const step2Completed = unlockedSteps.includes(ADSCRIPCION_STEPS.STEP3);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-80 rounded-md bg-muted animate-pulse" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-56 rounded-md bg-muted animate-pulse" />
            <div className="mt-2 h-4 w-72 rounded-md bg-muted animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header principal */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Proceso de adscripción</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona la asignación de estudiantes a prácticas en tres pasos: selección, notificación
          a establecimientos y notificación a estudiantes.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Flujo guiado de adscripción</CardTitle>
              <CardDescription>
                Completa cada paso en orden. Una vez creadas las fichas, podrás revisar la
                previsualización de correos y confirmar los envíos.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                <Users className="h-3.5 w-3.5" />
                <span>{allStudents.length} estudiantes cargados</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                <Mail className="h-3.5 w-3.5" />
                <span>{createdFichas.length} fichas generadas en este proceso</span>
              </span>
            </div>
          </div>

          {/* Tabs de pasos */}
          <Tabs value={currentStep} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-1 gap-1 sm:grid-cols-3">
              <TabsTrigger
                value={ADSCRIPCION_STEPS.STEP1}
                disabled={unlockedSteps.includes(ADSCRIPCION_STEPS.STEP2)}
                className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[10px]">
                  {step1Completed ? <Check className="h-3 w-3" /> : "1"}
                </span>
                <span>Selección y adscripción</span>
              </TabsTrigger>

              <TabsTrigger
                value={ADSCRIPCION_STEPS.STEP2}
                disabled={!unlockedSteps.includes(ADSCRIPCION_STEPS.STEP2)}
                className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[10px]">
                  {step2Completed ? <Check className="h-3 w-3" /> : "2"}
                </span>
                <span>Notificación al establecimiento</span>
              </TabsTrigger>

              <TabsTrigger
                value={ADSCRIPCION_STEPS.STEP3}
                disabled={!unlockedSteps.includes(ADSCRIPCION_STEPS.STEP3)}
                className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[10px]">
                  3
                </span>
                <span>Notificación a estudiantes</span>
              </TabsTrigger>
            </TabsList>

            {/* PASO 1 */}
            <TabsContent value={ADSCRIPCION_STEPS.STEP1} className="mt-6">
              <fieldset disabled={unlockedSteps.includes(ADSCRIPCION_STEPS.STEP2)}>
                <Card className="shadow-none border">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Paso 1: establecimiento, fechas y estudiantes
                    </CardTitle>
                    <CardDescription>
                      Selecciona el establecimiento, define las semanas de práctica y asigna a los
                      estudiantes a sus cupos disponibles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Establecimiento */}
                    <div className="space-y-2">
                      <Label htmlFor="establecimiento-select">
                        Establecimiento asignado a esta adscripción
                      </Label>
                      <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={comboboxOpen}
                            className="w-full justify-between sm:w-[400px]"
                          >
                            {selectedEstablecimientoId
                              ? allEstablecimientos.find(
                                  (e) => e.id === selectedEstablecimientoId
                                )?.nombre
                              : "Selecciona un establecimiento..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 sm:w-[400px]">
                          <Command>
                            <CommandInput placeholder="Buscar establecimiento..." />
                            <CommandEmpty>No se encontraron establecimientos.</CommandEmpty>
                            <CommandGroup>
                              <CommandList>
                                {allEstablecimientos.map((establecimiento) => (
                                  <CommandItem
                                    key={establecimiento.id}
                                    value={establecimiento.nombre}
                                    onSelect={() => {
                                      setSelectedEstablecimientoId(
                                        establecimiento.id === selectedEstablecimientoId
                                          ? null
                                          : establecimiento.id
                                      );
                                      setComboboxOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedEstablecimientoId === establecimiento.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {establecimiento.nombre}
                                  </CommandItem>
                                ))}
                              </CommandList>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Fechas */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Profesional */}
                      <Card className="shadow-none border bg-muted/40">
                        <CardHeader>
                          <CardTitle className="text-base">
                            Fechas de práctica profesional
                          </CardTitle>
                          <CardDescription className="text-xs space-y-1">
                            <p>Se aplican a los niveles marcados como &quot;Profesional&quot;.</p>
                            <p>
                              Sugerencia: selecciona el{" "}
                              <span className="font-semibold">lunes</span> de la semana de inicio y
                              término.
                            </p>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Fecha de inicio</Label>
                            <Input
                              type="date"
                              value={professionalDates.inicio}
                              onChange={(e) =>
                                setProfessionalDates((p) => ({ ...p, inicio: e.target.value }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Fecha de término</Label>
                            <Input
                              type="date"
                              value={professionalDates.termino}
                              onChange={(e) =>
                                setProfessionalDates((p) => ({ ...p, termino: e.target.value }))
                              }
                            />
                          </div>
                          {professionalDates.inicio && professionalDates.termino && (
                            <p className="text-xs text-muted-foreground">
                              Duración estimada:{" "}
                              <span className="font-semibold">
                                {calculateWeeks(
                                  professionalDates.inicio,
                                  professionalDates.termino
                                )}{" "}
                                semana(s)
                              </span>
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Pedagógicas */}
                      <Card className="shadow-none border bg-muted/40">
                        <CardHeader>
                          <CardTitle className="text-base">Fechas prácticas pedagógicas</CardTitle>
                          <CardDescription className="text-xs space-y-1">
                            <p>
                              Se aplican a todos los niveles que no son &quot;Profesional&quot;.
                            </p>
                            <p>
                              Sugerencia: selecciona el{" "}
                              <span className="font-semibold">lunes</span> de la semana de inicio y
                              término.
                            </p>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Fecha de inicio</Label>
                            <Input
                              type="date"
                              value={pedagogicalDates.inicio}
                              onChange={(e) =>
                                setPedagogicalDates((p) => ({ ...p, inicio: e.target.value }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Fecha de término</Label>
                            <Input
                              type="date"
                              value={pedagogicalDates.termino}
                              onChange={(e) =>
                                setPedagogicalDates((p) => ({ ...p, termino: e.target.value }))
                              }
                            />
                          </div>
                          {pedagogicalDates.inicio && pedagogicalDates.termino && (
                            <p className="text-xs text-muted-foreground">
                              Duración estimada:{" "}
                              <span className="font-semibold">
                                {calculateWeeks(
                                  pedagogicalDates.inicio,
                                  pedagogicalDates.termino
                                )}{" "}
                                semana(s)
                              </span>
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Estudiantes */}
                    <fieldset
                      disabled={!selectedEstablecimientoId}
                      className="space-y-8 disabled:opacity-60"
                    >
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              Buscar y agregar estudiantes
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Filtra por nombre, RUT, email o carrera y agrega los estudiantes a esta
                              adscripción.
                            </p>
                          </div>
                          {!selectedEstablecimientoId && (
                            <p className="text-xs text-destructive">
                              Selecciona primero un establecimiento para habilitar esta sección.
                            </p>
                          )}
                        </div>

                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Buscar por nombre, RUT, email o carrera..."
                            className="w-full pl-8 sm:w-[320px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>

                        {filteredAvailableStudents.length > 0 ? (
                          <Card className="max-h-60 overflow-y-auto border shadow-sm">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nombre completo</TableHead>
                                  <TableHead>Carrera</TableHead>
                                  <TableHead className="text-right">Acción</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredAvailableStudents.map((student) => (
                                  <TableRow key={student.id}>
                                    <TableCell>
                                      {`${student.nombre} ${student.ap_paterno} ${student.ap_materno}`}
                                    </TableCell>
                                    <TableCell>
                                      {getCarreraName(student.carrera_id)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAddStudent(student)}
                                      >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Agregar
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Card>
                        ) : (
                          <p className="py-4 text-center text-sm text-muted-foreground">
                            {searchTerm
                              ? "No se encontraron estudiantes con ese criterio."
                              : "No hay estudiantes disponibles para agregar."}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Estudiantes seleccionados ({selectedStudents.length})
                        </h3>
                        {selectedStudents.length > 0 ? (
                          <Card className="border shadow-sm">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nombre completo</TableHead>
                                  <TableHead>Carrera</TableHead>
                                  <TableHead>Cupo asignado</TableHead>
                                  <TableHead className="text-right">Acción</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedStudents.map((student) => {
                                  const availableCupos = getAvailableCuposForStudent(student);
                                  return (
                                    <TableRow key={student.id}>
                                      <TableCell>
                                        {`${student.nombre} ${student.ap_paterno} ${student.ap_materno}`}
                                      </TableCell>
                                      <TableCell>
                                        {getCarreraName(student.carrera_id)}
                                      </TableCell>
                                      <TableCell>
                                        <Select
                                          value={
                                            studentCupoAssignments[student.id]?.toString() || ""
                                          }
                                          onValueChange={(value) =>
                                            handleCupoAssignmentChange(student.id, value)
                                          }
                                          disabled={availableCupos.length === 0}
                                        >
                                          <SelectTrigger className="w-[220px]">
                                            <SelectValue placeholder="Seleccionar cupo..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableCupos.length > 0 ? (
                                              availableCupos.map((cupo) => (
                                                <SelectItem
                                                  key={cupo.id}
                                                  value={cupo.id.toString()}
                                                >
                                                  {getNivelName(cupo.nivel_practica_id)}
                                                </SelectItem>
                                              ))
                                            ) : (
                                              <SelectItem value="-" disabled>
                                                No hay cupos disponibles
                                              </SelectItem>
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleRemoveStudent(student)}
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Quitar
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </Card>
                        ) : (
                          <div className="flex min-h-[150px] flex-col items-center justify-center rounded-md border-2 border-dashed border-muted p-6 text-center">
                            <Users className="mb-2 h-12 w-12 text-muted-foreground opacity-50" />
                            <p className="text-sm text-muted-foreground">
                              Aún no has seleccionado estudiantes para esta adscripción.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Utiliza la búsqueda superior para agregarlos al listado.
                            </p>
                          </div>
                        )}
                      </div>
                    </fieldset>

                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={() => goToNextStep(ADSCRIPCION_STEPS.STEP2)}
                        disabled={!isStep1Valid || isCreatingFichas}
                      >
                        {isCreatingFichas ? "Creando fichas..." : "Crear fichas y continuar"}
                        {!isCreatingFichas && (
                          <ChevronRight className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </fieldset>
            </TabsContent>

            {/* PASO 2 */}
            <TabsContent value={ADSCRIPCION_STEPS.STEP2} className="mt-6">
              <Card className="shadow-none border">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Paso 2: notificación al establecimiento
                  </CardTitle>
                  <CardDescription>
                    Revisa la previsualización del correo de notificación. La plantilla se edita en
                    la sección <span className="font-semibold">&quot;Plantillas&quot;</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedEstablecimiento && selectedDirectivo && (
                    <div className="space-y-1 rounded-lg bg-muted/50 p-4 text-sm">
                      <p>
                        <span className="font-semibold">Establecimiento:</span>{" "}
                        {selectedEstablecimiento.nombre}
                      </p>
                      <p>
                        <span className="font-semibold">Comuna:</span>{" "}
                        {getComunaName(selectedEstablecimiento.comuna_id)}
                      </p>
                      <p>
                        <span className="font-semibold">Destinatario:</span>{" "}
                        {selectedDirectivo.nombre} ({selectedDirectivo.email})
                      </p>
                      <p>
                        <span className="font-semibold">Estudiantes incluidos:</span>{" "}
                        {createdFichas.length}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Previsualización del correo al establecimiento</Label>
                    <EditableHtmlDisplay
                      key={selectedEstablecimientoId || "no-establecimiento-selected"}
                      initialHtml={renderedEmail}
                      editable={false}
                      className="w-full min-h-[320px] max-h-[60vh] overflow-y-auto rounded-md border bg-background"
                      aria-label="Previsualización del contenido del correo"
                    />
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      variant="outline"
                      onClick={handleSendNotification}
                      disabled={!isStep2Valid || isSendingEmail || emailSent}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {isSendingEmail
                        ? "Enviando..."
                        : emailSent
                        ? "Notificación enviada"
                        : "Enviar notificación"}
                    </Button>
                    <Button
                      onClick={() => goToNextStep(ADSCRIPCION_STEPS.STEP3)}
                      disabled={!isStep2Valid}
                    >
                      Siguiente paso
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PASO 3 */}
            <TabsContent value={ADSCRIPCION_STEPS.STEP3} className="mt-6">
              <Card className="shadow-none border">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Paso 3: notificación a estudiantes
                  </CardTitle>
                  <CardDescription>
                    Define la fecha de envío por nivel, previsualiza el correo para cada
                    estudiante y procesa el envío.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8 lg:grid-cols-2">
                  {/* Columna izquierda: configuración por nivel */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Programación de envío por nivel</h3>
                    {Object.keys(studentsGroupedByLevel).length > 0 ? (
                      <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-2">
                        {Object.entries(studentsGroupedByLevel).map(
                          ([nivelId, { nivel, students }]) => (
                            <Card key={nivelId} className="bg-muted/40">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">{nivel.nombre}</CardTitle>
                                <CardDescription>
                                  {students.length} estudiante(s) en este nivel.
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`datetime-${nivelId}`}>
                                    Fecha y hora de envío
                                  </Label>
                                  <Input
                                    id={`datetime-${nivelId}`}
                                    type="datetime-local"
                                    value={scheduledSendTimes[nivelId] || ""}
                                    onChange={(e) =>
                                      setScheduledSendTimes((prev) => ({
                                        ...prev,
                                        [nivelId]: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <div className="text-sm">
                                  <p className="mb-1 font-medium">Estudiantes</p>
                                  <ul className="list-inside list-disc text-muted-foreground">
                                    {students.map((student) => (
                                      <li key={student.id}>
                                        <button
                                          onClick={() => setPreviewStudent(student)}
                                          className="text-left underline-offset-2 hover:underline disabled:cursor-default disabled:no-underline"
                                          disabled={previewStudent?.id === student.id}
                                        >
                                          {student.nombre} {student.ap_paterno}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay estudiantes para notificar en este proceso.
                      </p>
                    )}
                  </div>

                  {/* Columna derecha: previsualización */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Previsualización del correo al estudiante
                    </h3>
                    {previewStudent && (
                      <p className="text-sm text-muted-foreground">
                        Mostrando previsualización para:{" "}
                        <span className="font-medium text-foreground">
                          {previewStudent.nombre} {previewStudent.ap_paterno}
                        </span>
                      </p>
                    )}
                    <EditableHtmlDisplay
                      initialHtml={renderedStudentEmail}
                      editable={false}
                      className="w-full min-h-[380px] max-h-[60vh] overflow-y-auto rounded-md border bg-background"
                      aria-label="Previsualización del correo del estudiante"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleUpdateAndSendStudentEmails}
                    disabled={!isStep3Valid || isUpdatingAndSending || studentEmailsSent}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isUpdatingAndSending
                      ? "Procesando..."
                      : studentEmailsSent
                      ? "Correos enviados"
                      : "Actualizar y enviar correos"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
