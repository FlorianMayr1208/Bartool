import { useState, useCallback, useRef } from 'react';

interface DragItem {
  id: number;
  startIndex: number;
}

interface UseMobileDragDropProps {
  items: number[];
  onReorder: (newItems: number[]) => void;
}

export function useMobileDragDrop({ items, onReorder }: UseMobileDragDropProps) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent, id: number) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    const startIndex = items.indexOf(id);
    setDraggedItem({ id, startIndex });
    
    // Prevent scrolling while dragging
    e.preventDefault();
  }, [items]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggedItem || !touchStartPos.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
    
    // Start dragging if moved more than 10px
    if (!isDragging.current && (deltaX > 10 || deltaY > 10)) {
      isDragging.current = true;
      
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }

    if (isDragging.current) {
      // Find the element under the touch point
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const chipElement = elementBelow?.closest('[data-drag-id]');
      
      if (chipElement) {
        const targetId = parseInt(chipElement.getAttribute('data-drag-id') || '0');
        const targetIndex = items.indexOf(targetId);
        
        if (targetIndex !== -1 && targetIndex !== draggedItem.startIndex) {
          setDragOverIndex(targetIndex);
        }
      }
      
      // Prevent scrolling
      e.preventDefault();
    }
  }, [draggedItem, items]);

  const handleTouchEnd = useCallback(() => {
    if (!draggedItem || !isDragging.current) {
      // Reset without reordering if not actually dragging
      setDraggedItem(null);
      setDragOverIndex(null);
      touchStartPos.current = null;
      isDragging.current = false;
      return;
    }

    if (dragOverIndex !== null && dragOverIndex !== draggedItem.startIndex) {
      // Perform reorder
      const newItems = [...items];
      const [movedItem] = newItems.splice(draggedItem.startIndex, 1);
      newItems.splice(dragOverIndex, 0, movedItem);
      onReorder(newItems);
      
      // Provide success haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([30, 100, 30]);
      }
    }

    // Reset state
    setDraggedItem(null);
    setDragOverIndex(null);
    touchStartPos.current = null;
    isDragging.current = false;
  }, [draggedItem, dragOverIndex, items, onReorder]);

  const handleDragStart = useCallback((id: number) => {
    const startIndex = items.indexOf(id);
    setDraggedItem({ id, startIndex });
  }, [items]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetId: number) => {
    if (!draggedItem) return;

    const targetIndex = items.indexOf(targetId);
    if (targetIndex === -1 || targetIndex === draggedItem.startIndex) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(draggedItem.startIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);
    onReorder(newItems);

    setDraggedItem(null);
    setDragOverIndex(null);
  }, [draggedItem, items, onReorder]);

  const getDragProps = useCallback((id: number) => ({
    'data-drag-id': id,
    draggable: items.includes(id),
    onTouchStart: (e: React.TouchEvent) => handleTouchStart(e, id),
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onDragStart: () => handleDragStart(id),
    onDragOver: handleDragOver,
    onDrop: () => handleDrop(id),
  }), [items, handleTouchStart, handleTouchMove, handleTouchEnd, handleDragStart, handleDragOver, handleDrop]);

  const getItemState = useCallback((id: number) => ({
    isDragging: draggedItem?.id === id && isDragging.current,
    isDraggedOver: dragOverIndex === items.indexOf(id),
    isSelected: items.includes(id),
  }), [draggedItem, dragOverIndex, items]);

  return {
    getDragProps,
    getItemState,
    isDragging: isDragging.current,
  };
}