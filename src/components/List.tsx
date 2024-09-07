'use client'

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  closestCenter,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableRow from "./SortableRow";

const DndContextWithNoSSR = dynamic(
  () => import("@dnd-kit/core").then((mod) => mod.DndContext),
  { ssr: false }
);

export type Item = {
  id: number;
  artist: string;
  title: string;
  sequence: number;
};

type Props = {
  data: Item[];
};

const List = ({ data }: Props) => {
  const [items, setItems] = useState(data);
  const [activeItem, setActiveItem] = useState<Item | undefined>(undefined);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const removeItem = (id: number) => {
    const updateData = items
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, sequence: index + 1 }));
    return setItems(updateData);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const update = items.find((item) => item.sequence === active.id);
    setActiveItem(update);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeIndex = items.findIndex((ex) => ex.sequence === active.id);
    const overIndex = items.findIndex((ex) => ex.sequence === over.id);

    if (activeIndex !== overIndex) {
      setItems((prev) => {
        const update = arrayMove(prev, activeIndex, overIndex).map(
          (ex, index) => ({ ...ex, sequence: index + 1 })
        );
        return update;
      });
    }

    setActiveItem(undefined);
  };

  const handleDragCancel = () => {
    setActiveItem(undefined);
  };

  return (
    <div className="flex flex-col gap-2 w-1/2 mx-auto">
      {items?.length ? (
        <DndContextWithNoSSR
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={items.map((item) => item.sequence)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <SortableRow key={item.id} item={item} removeItem={removeItem} />
            ))}
          </SortableContext>

          <DragOverlay adjustScale style={{ transformOrigin: "0 0 " }}>
            {activeItem ? (
              <SortableRow
                item={activeItem}
                removeItem={removeItem}
                forceDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContextWithNoSSR>
      ) : null}
    </div>
  );
};

export default List;