'use client';

import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/shared/components/button';
import { TextInput } from '@/shared/components/form-fields';
import type { ProjectFormValues } from '@/features/project/types/create-project-form';

export function TimelineEditor() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProjectFormValues>();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'timelines',
  });

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previousRects = useRef<Map<string, DOMRect>>(new Map());

  const captureRects = () => {
    const rects = new Map<string, DOMRect>();
    for (const field of fields) {
      const el = itemRefs.current[field.id];
      if (!el) continue;
      rects.set(field.id, el.getBoundingClientRect());
    }
    previousRects.current = rects;
  };

  useLayoutEffect(() => {
    for (const field of fields) {
      const el = itemRefs.current[field.id];
      const previous = previousRects.current.get(field.id);
      if (!el || !previous) continue;

      const current = el.getBoundingClientRect();
      const deltaX = previous.left - current.left;
      const deltaY = previous.top - current.top;

      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) continue;

      el.animate(
        [
          { transform: `translate(${deltaX}px, ${deltaY}px)` },
          { transform: 'translate(0, 0)' },
        ],
        {
          duration: 300,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        }
      );
    }
  }, [fields]);

  useEffect(() => {
    if (!highlightedId) return;
    const timeout = setTimeout(() => setHighlightedId(null), 650);
    return () => clearTimeout(timeout);
  }, [highlightedId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Susun fase timeline proyek.</p>
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={() => append({ timeRange: '', phaseDescription: '' })}
        >
          <Plus className="size-4" />
          Tambah Fase
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            ref={el => {
              itemRefs.current[field.id] = el;
            }}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragOver={event => {
              event.preventDefault();
              if (overIndex !== index) setOverIndex(index);
            }}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) return;
              captureRects();
              setHighlightedId(fields[dragIndex]?.id ?? null);
              move(dragIndex, index);
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={[
              'rounded-lg border bg-white p-4 transition-colors duration-200',
              highlightedId === field.id ? 'border-primary bg-primary/6' : 'border-primary/10',
              overIndex === index && dragIndex !== null ? 'border-primary/40 bg-primary/4' : '',
            ].join(' ')}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <GripVertical className="size-4 text-gray-400" />
                Fase {index + 1}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="size-4" />
                Hapus
              </Button>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <TextInput
                label="Rentang Waktu"
                placeholder="Contoh: 2026-2028"
                required
                error={errors.timelines?.[index]?.timeRange?.message}
                {...register(`timelines.${index}.timeRange`)}
              />
              <TextInput
                label="Deskripsi Fase"
                required
                placeholder="Contoh: Persiapan lahan dan perizinan"
                error={errors.timelines?.[index]?.phaseDescription?.message}
                {...register(`timelines.${index}.phaseDescription`)}
              />
            </div>
          </div>
        ))}
      </div>

      {typeof errors.timelines?.message === 'string' ? (
        <p className="text-xs text-danger">{errors.timelines.message}</p>
      ) : null}
    </div>
  );
}
