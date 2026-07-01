
"use client";

import * as React from "react";
import type { FechaClave } from "@/lib/definitions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const fechaClaveSchema = z.object({
  nombre: z.string().min(3, "El nombre es requerido"),
  fecha: z.string().min(1, "La fecha es requerida"),
  descripcion: z.string().optional().nullable(),
});

type FechaClaveFormValues = z.infer<typeof fechaClaveSchema>;

interface FechaClaveFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: FechaClave) => Promise<void>;
  initialData?: FechaClave | null;
}

export function FechaClaveForm({ isOpen, onOpenChange, onSubmit, initialData }: FechaClaveFormProps) {
  
  const defaultValues = { nombre: "", fecha: "", descripcion: "" };

  const form = useForm<FechaClaveFormValues>({
    resolver: zodResolver(fechaClaveSchema),
    defaultValues: initialData || defaultValues,
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset(initialData || defaultValues);
    }
  }, [initialData, form, isOpen]);

  const handleFormSubmit = async (data: FechaClaveFormValues) => {
    await onSubmit(data as FechaClave);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {initialData ? "Editar Fecha Clave" : "Agregar Nueva Fecha"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Fecha</FormLabel>
                  <FormControl><Input placeholder="Ej: Inicio Profesional" {...field} /></FormControl>
                  <FormDescription className="text-[10px]">
                    Nombres recomendados: "Inicio Profesional", "Término Profesional", "Inicio Pedagógica", "Término Pedagógica".
                  </FormDescription>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="fecha" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="descripcion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl><Textarea placeholder="Breve descripción del hito..." {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : (initialData ? "Actualizar" : "Agregar")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
