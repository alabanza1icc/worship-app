"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Music, GripVertical, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetlistItem {
  id: string;
  songs: {
    id: string;
    title: string;
    artist: string;
    original_key: string;
    song_parts?: { id: string; name: string; content: string; order_index: number }[];
  };
  custom_key: string | null;
  director_notes: string | null;
  order_index: number;
}

interface SetlistClientProps {
  eventId: string;
  items: SetlistItem[];
  isAdmin: boolean;
}

function SortableItem({ item, isAdmin, onDelete, onNotesChange, onKeyChange }: {
  item: SetlistItem;
  isAdmin: boolean;
  onDelete: () => void;
  onNotesChange: (notes: string) => void;
  onKeyChange: (key: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const parts = item.songs?.song_parts || [];
  const hasChords = parts.some(p => p.content.match(/[A-G][#b]?/));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-slate-200 bg-white/80 overflow-hidden",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center gap-3 p-4">
        {isAdmin && (
          <button {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-500">
            <GripVertical className="h-5 w-5" />
          </button>
        )}

        <div className="flex-1">
          <div className="font-medium">{item.songs?.title || "Canción"}</div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{item.songs?.artist || "Artista"}</span>
            {item.custom_key && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                {item.custom_key}
              </span>
            )}
            {!item.custom_key && item.songs?.original_key && (
              <span className="text-xs text-slate-400">
                ({item.songs.original_key})
              </span>
            )}
          </div>
        </div>

        {hasChords && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-500 hover:text-slate-950"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        )}

        <button
          onClick={() => setShowNotes(!showNotes)}
          className="p-2 text-slate-500 hover:text-slate-950"
        >
          📝
        </button>

        {isAdmin && (
          <button
            onClick={onDelete}
            className="p-2 text-red-500 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {showNotes && (
        <div className="border-t border-slate-200 p-4">
          <textarea
            value={item.director_notes || ""}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notas del director..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-950 placeholder-slate-400"
            rows={2}
          />
        </div>
      )}

      {isExpanded && hasChords && (
        <div className="border-t border-slate-200 p-4 font-mono text-sm leading-relaxed">
          {parts.sort((a, b) => a.order_index - b.order_index).map((part) => (
            <div key={part.id} className="mb-4">
              <div className="mb-1 text-xs font-semibold text-indigo-600">{part.name}</div>
              <pre className="whitespace-pre-wrap">{part.content}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SetlistClient({ eventId, items: initialItems, isAdmin }: SetlistClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isAddingSong, setIsAddingSong] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update order on server
      try {
        await fetch(`/api/events/${eventId}/songs`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventSongId: active.id,
            order_index: newIndex,
          }),
        });
      } catch (error) {
        console.error("Error updating order:", error);
        router.refresh();
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/events/${eventId}/songs?eventSongId=${id}`, {
        method: "DELETE",
      });
      setItems(items.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Error deleting song:", error);
      router.refresh();
    }
  };

  const handleNotesChange = async (id: string, notes: string) => {
    try {
      await fetch(`/api/events/${eventId}/songs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSongId: id,
          director_notes: notes,
        }),
      });
      setItems(items.map((i) => i.id === id ? { ...i, director_notes: notes } : i));
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const handleKeyChange = async (id: string, key: string) => {
    try {
      await fetch(`/api/events/${eventId}/songs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSongId: id,
          custom_key: key,
        }),
      });
      setItems(items.map((i) => i.id === id ? { ...i, custom_key: key } : i));
    } catch (error) {
      console.error("Error updating key:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Setlist</h3>
        {isAdmin && (
          <button
            onClick={() => setIsAddingSong(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Añadir canción
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <Music className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <p className="text-sm text-slate-500">No hay canciones en el setlist</p>
          {isAdmin && (
            <button
              onClick={() => setIsAddingSong(true)}
              className="mt-3 text-sm text-indigo-600 hover:underline"
            >
              Añadir primera canción
            </button>
          )}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onDelete={() => handleDelete(item.id)}
                  onNotesChange={(notes) => handleNotesChange(item.id, notes)}
                  onKeyChange={(key) => handleKeyChange(item.id, key)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}