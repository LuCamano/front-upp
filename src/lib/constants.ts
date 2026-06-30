import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, School, ClipboardCheck, FileText, Upload, BookOpenCheck, UserCheck, GraduationCap, MapPin } from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Alumnos',
    href: '/alumnos',
    icon: Users,
  },
  {
    label: 'Colegios',
    href: '/colegios',
    icon: School,
  },
  {
    label: 'Tutores',
    href: '/tutores',
    icon: UserCheck,
  },
  {
    label: 'Carreras',
    href: '/carreras',
    icon: GraduationCap,
  },
   {
    label: 'Comunas',
    href: '/comunas',
    icon: MapPin,
  },
  {
    label: 'Asignación',
    href: '/asignacion',
    icon: ClipboardCheck,
  },
  {
    label: 'Carga Masiva',
    href: '/carga-masiva',
    icon: Upload,
  },
  {
    label: 'Plantillas',
    href: '/plantillas',
    icon: FileText,
  },
];

export const APP_NAME = "Gestión de prácticas";
export const APP_LOGO_ICON = BookOpenCheck;
