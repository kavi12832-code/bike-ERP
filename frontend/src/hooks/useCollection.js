import { useCallback } from 'react';
import { useAppStore } from '../store';

const EMPTY = [];

/**
 * Module data stored in the backend collections API (e.g. "care.complaints").
 *
 * Drop-in for `useState([...])`: returns `[items, setItems]`. Items come from the server (loaded at
 * login); `setItems(next | updater)` updates the screen immediately and the store sync engine saves
 * the created / changed / removed records to the database.
 */
export function useCollection(name) {
  const items = useAppStore((state) => state.collections?.[name] ?? EMPTY);
  const setCollection = useAppStore((state) => state.setCollection);
  const setItems = useCallback(
    (next) => {
      const current = useAppStore.getState().collections?.[name] ?? EMPTY;
      setCollection(name, typeof next === 'function' ? next(current) : next);
    },
    [name, setCollection]
  );
  return [items, setItems];
}

/** Read-only variant for lists a page only displays. */
export function useCollectionItems(name) {
  return useAppStore((state) => state.collections?.[name] ?? EMPTY);
}
