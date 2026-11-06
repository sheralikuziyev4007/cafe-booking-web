import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import { moveInArray } from "@/utils/array";
import { useServices } from "./useServices";
import type { MenuItem, MenuItemInput } from "@/types";

/** The menu: `data`, `isPending`, `isError`, `refetch`… (TanStack Query result) */
export function useMenu() {
  const { menu } = useServices();
  return useQuery({
    queryKey: queryKeys.menu,
    queryFn: () => menu.list(),
    // Demo storage is synchronous, so the menu is there on the very first render (no skeleton flash)
    initialData: () => menu.peek?.(),
  });
}

type Snapshot = { previous: MenuItem[] | undefined };

/** Menu changes for the admin panel. Changes show up at once and are rolled back if the request fails. */
export function useMenuActions() {
  const { menu } = useServices();
  const queryClient = useQueryClient();
  const key = queryKeys.menu;

  const optimistic = <V>(apply: (items: MenuItem[], variables: V) => MenuItem[]) => ({
    onMutate: async (variables: V): Promise<Snapshot> => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MenuItem[]>(key);
      if (previous) queryClient.setQueryData<MenuItem[]>(key, apply(previous, variables));
      return { previous };
    },
    onError: (_error: Error, _variables: V, context: Snapshot | undefined) => {
      if (context?.previous) queryClient.setQueryData<MenuItem[]>(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const addItem = useMutation({
    mutationFn: (item: MenuItemInput) => menu.create(item),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const updateItem = useMutation({
    mutationFn: ({ id, item }: { id: string; item: MenuItemInput }) => menu.update(id, item),
    ...optimistic<{ id: string; item: MenuItemInput }>((items, { id, item }) => items.map((m) => (m.id === id ? { ...item, id } : m))),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => menu.remove(id),
    ...optimistic<string>((items, id) => items.filter((m) => m.id !== id)),
  });

  const toggleAvailability = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) => menu.setAvailability(id, isAvailable),
    ...optimistic<{ id: string; isAvailable: boolean }>((items, { id, isAvailable }) =>
      items.map((m) => (m.id === id ? { ...m, isAvailable } : m))
    ),
  });

  const moveItem = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: -1 | 1 }) => menu.move(id, direction),
    ...optimistic<{ id: string; direction: -1 | 1 }>((items, { id, direction }) => moveInArray(items, id, direction)),
  });

  return { addItem, updateItem, deleteItem, toggleAvailability, moveItem };
}
