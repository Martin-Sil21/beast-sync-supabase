import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { ChatModal } from "@/components/chat/ChatModal";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const columns = [
  { id: "cargadas", title: "Fichas cargadas", tone: "accent" },
  { id: "publi", title: "Publi gral influ", tone: "accent" },
  { id: "principal", title: "Principal", tone: "primary" },
  { id: "fake", title: "FAKE/ESTAFA", tone: "destructive" },
  { id: "soporte", title: "SOPORTE", tone: "ring" },
] as const;

type Lead = {
  id: string;
  name: string;
  note: string;
};

const initialLeads: Record<typeof columns[number]["id"], Lead[]> = {
  cargadas: [
    { id: "lead-1", name: "0708alexxx", note: "cargado" },
    { id: "lead-2", name: "Emily723", note: "cargadooo" },
  ],
  publi: [
    { id: "lead-3", name: "Melany7812", note: "Tu usuario es..." },
    { id: "lead-4", name: "Samuel7812", note: "Bienvenido a..." },
  ],
  principal: [
    { id: "lead-5", name: "Isaias78241", note: "Mensaje multi..." },
    { id: "lead-6", name: "Mary6245", note: "cargadoo" },
  ],
  fake: [
    { id: "lead-7", name: "adasdasd121", note: "Le pasaste a otra..." },
  ],
  soporte: [
    { id: "lead-8", name: "pelu1237", note: "Chat cerrado..." },
  ],
};

// Componente para cada columna que es droppable
function DroppableColumn({ children, columnId }: { children: React.ReactNode; columnId: string }) {
  const { setNodeRef } = useDroppable({
    id: `column-${columnId}`,
  });

  return (
    <div
      ref={setNodeRef}
      className="space-y-2 min-h-[200px] p-2 rounded-lg"
    >
      {children}
    </div>
  );
}

// Componente para cada chat individual que es draggable
function DraggableChat({ lead, onOpenChat }: { lead: Lead; onOpenChat: (lead: Lead) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card/60 p-3 hover:bg-muted/40 transition ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <div className="font-medium">{lead.name}</div>
          <div className="text-xs text-muted-foreground truncate">{lead.note}</div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 ml-2"
          onClick={(e) => {
            e.stopPropagation();
            onOpenChat(lead);
          }}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Pipeline() {
  const [leads, setLeads] = useState<Record<typeof columns[number]["id"], Lead[]>>(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const handleOpenChat = (lead: Lead) => {
    setSelectedLead(lead);
    setIsChatModalOpen(true);
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar la columna de origen y destino
    const activeColumnId = findColumnByLeadId(activeId);
    const overColumnId = overId.startsWith('column-') ? overId.replace('column-', '') : findColumnByLeadId(overId);
    
    if (!activeColumnId || !overColumnId) return;

    if (activeColumnId !== overColumnId) {
      // Mover entre columnas
      setLeads((prev) => {
        const activeItems = [...prev[activeColumnId]];
        const overItems = [...prev[overColumnId]];
        
        const activeIndex = activeItems.findIndex(item => item.id === activeId);
        const activeLead = activeItems[activeIndex];
        
        // Remover de la columna origen
        activeItems.splice(activeIndex, 1);
        
        // Agregar a la columna destino
        if (overId.startsWith('column-')) {
          // Dropped on column, add to end
          overItems.push(activeLead);
        } else {
          // Dropped on specific item, insert at that position
          const overIndex = overItems.findIndex(item => item.id === overId);
          overItems.splice(overIndex, 0, activeLead);
        }

        return {
          ...prev,
          [activeColumnId]: activeItems,
          [overColumnId]: overItems,
        };
      });
    } else {
      // Reordenar dentro de la misma columna
      setLeads((prev) => {
        const items = [...prev[activeColumnId]];
        const activeIndex = items.findIndex(item => item.id === activeId);
        const overIndex = items.findIndex(item => item.id === overId);
        
        if (activeIndex !== overIndex) {
          const reorderedItems = arrayMove(items, activeIndex, overIndex);
          return {
            ...prev,
            [activeColumnId]: reorderedItems,
          };
        }
        
        return prev;
      });
    }
  }

  function findColumnByLeadId(leadId: string): keyof typeof leads | null {
    for (const [columnId, columnLeads] of Object.entries(leads)) {
      if (columnLeads.find(lead => lead.id === leadId)) {
        return columnId as keyof typeof leads;
      }
    }
    return null;
  }

  function findLeadById(leadId: string): Lead | null {
    for (const columnLeads of Object.values(leads)) {
      const lead = columnLeads.find(lead => lead.id === leadId);
      if (lead) return lead;
    }
    return null;
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <p className="text-sm text-muted-foreground">Organiza tus conversaciones por etapas.</p>
      </section>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {columns.map((col) => (
            <Card key={col.id} className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{col.title}</span>
                  <Badge variant="secondary">{leads[col.id].length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <DroppableColumn columnId={col.id}>
                  <SortableContext 
                    items={leads[col.id].map(lead => lead.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {leads[col.id].map((lead) => (
                      <DraggableChat key={lead.id} lead={lead} onOpenChat={handleOpenChat} />
                    ))}
                  </SortableContext>
                </DroppableColumn>
                <div className="rounded-lg border border-dashed text-muted-foreground text-sm p-3 grid place-items-center">
                  + Agregar
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
        
        <DragOverlay>
          {activeId ? (
            <div className="rounded-lg border bg-card/90 backdrop-blur-sm p-3 shadow-lg rotate-3 scale-105 animate-pulse">
              {(() => {
                const activeLead = findLeadById(activeId);
                return activeLead ? (
                  <>
                    <div className="font-medium">{activeLead.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{activeLead.note}</div>
                  </>
                ) : null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Chat Modal */}
      {selectedLead && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedLead(null);
          }}
          contact={{
            id: selectedLead.id,
            name: selectedLead.name,
            phone: "+54 11 1234-5678",
            lastSeen: new Date(Date.now() - 5 * 60 * 1000),
            isOnline: Math.random() > 0.5
          }}
          availableSessions={[
            { id: "whatsapp-1", name: "WhatsApp Comercial", type: "whatsapp", status: "connected" },
            { id: "instagram-1", name: "Instagram @empresa", type: "instagram", status: "connected" },
            { id: "facebook-1", name: "Facebook Page", type: "facebook", status: "disconnected" },
            { id: "webchat-1", name: "Chat Web", type: "webchat", status: "connected" }
          ]}
        />
      )}
    </div>
  );
}
