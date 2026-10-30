import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

const KEY = "test:list";
const parseList = (raw: unknown) => (Array.isArray(raw) ? (raw as string[]) : null);

function fireStorage(key: string, newValue: string | null) {
  window.dispatchEvent(new StorageEvent("storage", { key, newValue, storageArea: window.localStorage }));
}

describe("useLocalStorage", () => {
  it("picks up a change made in another tab", () => {
    const { result } = renderHook(() => useLocalStorage<string[]>(KEY, [], parseList));
    expect(result.current[0]).toEqual([]);

    act(() => fireStorage(KEY, JSON.stringify(["latte"])));
    expect(result.current[0]).toEqual(["latte"]);
  });

  it("ignores other keys, unreadable values and data rejected by parse", () => {
    const { result } = renderHook(() => useLocalStorage<string[]>(KEY, ["a"], parseList));

    act(() => fireStorage("other:key", JSON.stringify(["x"])));
    act(() => fireStorage(KEY, "{not json"));
    act(() => fireStorage(KEY, JSON.stringify({ not: "a list" })));
    act(() => fireStorage(KEY, null));
    expect(result.current[0]).toEqual(["a"]);
  });

  it("stops listening after unmount", () => {
    const { result, unmount } = renderHook(() => useLocalStorage<string[]>(KEY, [], parseList));
    unmount();
    act(() => fireStorage(KEY, JSON.stringify(["late"])));
    expect(result.current[0]).toEqual([]);
  });
});
