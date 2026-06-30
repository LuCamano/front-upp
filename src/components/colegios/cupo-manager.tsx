"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Establecimiento, Cupo, NivelPractica, Carrera, Ficha } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const cupoSchema = z.object({
  nivel_practica_id: z.string().min(1, "Debe seleccionar un nivel de práctica."),
  cantidad: z.coerce.number().min(1, "Mínimo 1").max(50, "Máximo 50"),
});

type CupoFormValues = z.infer<typeof cupoSchema>;

interface CupoManagerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  establecimiento: Establecimiento;
  cupos: Cupo[];
  nivelesPractica: NivelPractica[];
  carreras: Carrera[];
  fichas: Ficha[];
  onAddCupo: (data: CupoFormValues) => Promise<void>;
  onDeleteCupo: (cupoId: number) => Promise<void>;
  onDeleteCupoCascading: (cupoId: number, fichaId: number) => Promise<void>;
}

export function CupoManager({
  isOpen,
  onOpenChange,
  establecimiento,
  cupos,
  nivelesPractica,
  carreras,
  fichas,
  onAddCupo,
  onDeleteCupo,
  onDeleteCupoCascading,
}: CupoManagerProps) {
  const { toast } = useToast();
  const [cupoToDelete, setCupoToDelete] = React.useState<Cupo | null>(null);
  const [showCascadeDeleteAlert, setShowCascadeDeleteAlert] = React.useState(false);
  const [comboboxOpen, setComboboxOpen] = React.useState(false);
  
  const form = useForm<CupoFormValues>({
    resolver: zodResolver(cupoSchema),
    defaultValues: { nivel_practica_id: "", cantidad: 1 },
  });
  
  const getCarreraName = (carreraId: number) => carreras.find(c => c.id === carreraId)?.nombre || 'Carrera Desconocida';

  const nivelPracticaOptions = React.useMemo(() => {
    return nivelesPractica.map(nivel => ({
      ...nivel,
      carreraNombre: getCarreraName(nivel.carrera_id),
      searchLabel: `${nivel.nombre} ${getCarreraName(nivel.carrera_id)}`.toLowerCase(),
    }));
  }, [nivelesPractica, carreras]);

  const getNivelInfo = (nivelId: number) => {
    const nivel = nivelPracticaOptions.find(n => n.id === nivelId);
    if (!nivel) return { nombre: "Nivel Desconocido", carreraNombre: "" };
    return { nombre: nivel.nombre, carreraNombre: nivel.carreraNombre };
  }

  const handleFormSubmit = async (data: CupoFormValues) => {
    await onAddCupo(data);
    form.reset({ nivel_practica_id: "", cantidad: 1 });
  };

  const handleDeleteAttempt = async (cupo: Cupo) => {
    setCupoToDelete(cupo);
    try {
        await onDeleteCupo(cupo.id);
    } catch (error) {
        const associatedFicha = fichas.find(f => f.cupo_id === cupo.id);
        if (associatedFicha) {
            setShowCascadeDeleteAlert(true);
        } else {
            toast({
              title: "Error al eliminar",
              description: "No se pudo eliminar el cupo. Contacte al administrador si el problema persiste.",
              variant: "destructive"
            });
        }
    }
  };

  const handleCascadeDeleteConfirm = async () => {
    if (!cupoToDelete) return;
    const associatedFicha = fichas.find(f => f.cupo_id === cupoToDelete.id);
    if (associatedFicha) {
        await onDeleteCupoCascading(cupoToDelete.id, associatedFicha.id);
    }
    setShowCascadeDeleteAlert(false);
    setCupoToDelete(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-w-[95vw] bg-card overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle>Gestionar Cupos de Práctica</DialogTitle>
          <DialogDescription className="truncate">
            Añade o elimina cupos para el establecimiento{" "}
            <span className="font-semibold">{establecimiento.nombre}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4 py-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col gap-3 sm:flex-row sm:items-start min-w-0">
              <FormField
                control={form.control}
                name="nivel_practica_id"
                render={({ field }) => (
                  <FormItem className="flex-[3] min-w-0">
                    <FormLabel className="sr-only">Nivel de Práctica</FormLabel>
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between font-normal min-w-0 overflow-hidden",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate text-left flex-1 min-w-0">
                              {field.value
                                ? (() => {
                                    const info = getNivelInfo(Number(field.value));
                                    return `${info.nombre} (${info.carreraNombre})`;
                                  })()
                                : "Buscar nivel o carrera..."}
                            </span>
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Ej: Básica o Profesional..." />
                          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {nivelPracticaOptions.map((nivel) => (
                                <CommandItem
                                  key={nivel.id}
                                  value={nivel.searchLabel}
                                  onSelect={() => {
                                    form.setValue("nivel_practica_id", String(nivel.id));
                                    setComboboxOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 shrink-0",
                                      field.value === String(nivel.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col min-w-0 overflow-hidden">
                                    <span className="text-sm font-medium truncate">{nivel.nombre}</span>
                                    <span className="text-xs text-muted-foreground truncate">{nivel.carreraNombre}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem className="sm:w-24 shrink-0">
                    <FormLabel className="sr-only">Cantidad</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Cant.</span>
                        <Input 
                          type="number" 
                          min={1} 
                          max={50} 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={form.formState.isSubmitting} className="sm:w-auto shrink-0">
                {form.formState.isSubmitting ? "Agregando..." : "Agregar"}
              </Button>
            </form>
          </Form>

          <div className="rounded-md border h-[300px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[40%]">Nivel</TableHead>
                  <TableHead className="w-[45%]">Carrera</TableHead>
                  <TableHead className="w-[15%] text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cupos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No hay cupos para este establecimiento.
                    </TableCell>
                  </TableRow>
                ) : (
                  cupos.map((cupo) => {
                    const { nombre, carreraNombre } = getNivelInfo(cupo.nivel_practica_id);
                    return (
                        <TableRow key={cupo.id}>
                            <TableCell className="max-w-0">
                                <div className="truncate" title={nombre}>{nombre}</div>
                            </TableCell>
                            <TableCell className="max-w-0">
                                <div className="truncate" title={carreraNombre}>{carreraNombre}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="destructive" size="icon" onClick={() => handleDeleteAttempt(cupo)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                        </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>

        <AlertDialog open={showCascadeDeleteAlert} onOpenChange={setShowCascadeDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cupo en Uso</AlertDialogTitle>
              <AlertDialogDescription>
                Este cupo está asignado a un estudiante. Para eliminarlo, también se debe eliminar la ficha de práctica del estudiante. ¿Deseas continuar? Esta acción es irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCupoToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleCascadeDeleteConfirm}>
                Sí, eliminar ficha y cupo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </DialogContent>
    </Dialog>
  );
}
