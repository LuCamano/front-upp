import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/40">
        {/* Sidebar fija a la izquierda */}
        <AppSidebar />

        {/* Contenedor principal */}
        <div className="flex min-h-screen flex-1 flex-col border-l bg-background/60">
          {/* Header superior */}
          <AppHeader />

          {/* Área de contenido */}
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
