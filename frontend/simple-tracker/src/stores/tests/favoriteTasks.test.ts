import { setActivePinia, createPinia } from "pinia";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { useFavoriteTasksStore } from "../favoriteTasks";
import { getFavorites, updateTask } from "../../common/supabaseClient";
import { useTasksStore } from "../tasks";

//mock the supabase client
vi.mock("../../common/supabaseClient", () => ({
  getFavorites: vi.fn(),
  updateTask: vi.fn(),
}));

describe("favoriteTasks Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should initialize with empty favorites array", () => {
    const store = useFavoriteTasksStore();
    expect(store.favorites).toEqual([]);
  });

  it("should fetch favorites and update store", async () => {
    const mockTasks = [
      {
        id: "1",
        name: "Task 1",
        alt_code: "T1",
        created_at: "2023-01-01T00:00:00.000Z",
        user_id: "",
        is_favorite: true,
      },
      {
        id: "2",
        name: "Task 2",
        alt_code: "T2",
        created_at: "2023-01-01T00:00:00.000Z",
        user_id: "",
        is_favorite: true,
      },
    ];

    //mock the getFavorites response
    vi.mocked(getFavorites).mockResolvedValueOnce(mockTasks);

    const store = useFavoriteTasksStore();
    const tasksStore = useTasksStore();
    for (const t of mockTasks) {
      tasksStore.put(t);
    }
    await store.fetchFavorites();

    expect(getFavorites).toHaveBeenCalledTimes(1);
    expect(store.favorites).toEqual(mockTasks);
  });

  it("should not update favorites if getFavorites returns null", async () => {
    vi.mocked(getFavorites).mockResolvedValueOnce(null);

    const store = useFavoriteTasksStore();
    await store.fetchFavorites();

    expect(getFavorites).toHaveBeenCalledTimes(1);
    expect(store.favorites).toEqual([]);
  });

  it("should add a favorite to the favorites list", async () => {
    const mockTask = {
      id: "1",
      name: "Task 1",
      alt_code: "T1",
      created_at: "2023-01-01T00:00:00.000Z",
      user_id: "",
      is_favorite: false,
    };
    vi.mocked(updateTask).mockResolvedValue(true);

    const store = useFavoriteTasksStore();
    const tasksStore = useTasksStore();
    tasksStore.put(mockTask);
    await store.addFavorite(mockTask);

    expect(store.favorites).toContainEqual(mockTask);
    expect(store.favorites).toHaveLength(1);
    expect(mockTask.is_favorite).toBe(true);
  });

  it("should not add duplicates to the list", async () => {
    const mockTask = {
      id: "1",
      name: "Task 1",
      alt_code: "T1",
      created_at: "2023-01-01T00:00:00.000Z",
      user_id: "",
      is_favorite: true,
    };
    vi.mocked(updateTask).mockResolvedValue(true);

    const store = useFavoriteTasksStore();
    const tasksStore = useTasksStore();
    tasksStore.put(mockTask);

    await store.addFavorite(mockTask);
    await store.addFavorite(mockTask);

    expect(store.favorites).toContainEqual(mockTask);
    expect(store.favorites).toHaveLength(1);
  });

  it("should revert favorite addition if updateTask fails", async () => {
    const mockTask = {
      id: "1",
      name: "Task 1",
      alt_code: "T1",
      created_at: "2023-01-01T00:00:00.000Z",
      user_id: "",
      is_favorite: false,
    };

    vi.mocked(updateTask).mockResolvedValue(false);

    const store = useFavoriteTasksStore();
    const tasksStore = useTasksStore();
    tasksStore.put(mockTask);

    await expect(store.addFavorite(mockTask)).rejects.toThrow(
      "Failed to add favorite task"
    );

    expect(updateTask).toHaveBeenCalledWith(mockTask);
    expect(store.favorites).not.toContainEqual(mockTask);
    // expect(store.favorites).toHaveLength(0);
    // expect(mockTask.is_favorite).toBe(false);
  });

  it("should remove a given favorite form the list", async () => {
    const mockTasks = [
      {
        id: "1",
        name: "Task 1",
        alt_code: "T1",
        created_at: "2023-01-01T00:00:00.000Z",
        user_id: "",
        is_favorite: true,
      },
      {
        id: "2",
        name: "Task 2",
        alt_code: "T1",
        created_at: "2023-01-01T00:00:00.000Z",
        user_id: "",
        is_favorite: true,
      },
      {
        id: "3",
        name: "Task 3",
        alt_code: "T3",
        created_at: "2023-01-01T00:00:00.000Z",
        user_id: "",
        is_favorite: true,
      },
    ];
    vi.mocked(updateTask).mockResolvedValue(true);

    const store = useFavoriteTasksStore();
    const tasksStore = useTasksStore();
    for (const t of mockTasks) {
      tasksStore.put(t);
      await store.addFavorite(t);
    }

    expect(store.favorites).toHaveLength(mockTasks.length);

    await store.removeFavorite(mockTasks[1]);
    expect(store.favorites).toHaveLength(2);
    expect(store.favorites).not.toContainEqual(mockTasks[1]);
    expect(mockTasks[1].is_favorite).toBe(false);
  });

  it("should revert deletion if updateTask returns false", async () => {
    const mockTask = {
      id: "1",
      name: "Task 1",
      alt_code: "T1",
      created_at: "2023-01-01T00:00:00.000Z",
      user_id: "",
      is_favorite: true,
    };
    vi.mocked(updateTask).mockResolvedValue(true);
    const store = useFavoriteTasksStore();
    const tasksStore = useTasksStore();
    tasksStore.put(mockTask);
    await store.addFavorite(mockTask);
    expect(store.favorites).toHaveLength(1);

    vi.mocked(updateTask).mockResolvedValue(false);
    await expect(store.removeFavorite(mockTask)).rejects.toThrow(
      "Failed to remove favorite task"
    );
    expect(store.favorites).toContainEqual(mockTask);
    expect(mockTask.is_favorite).toBe(true);
  });

  it("should do nothing on remove from empty list", async () => {
    const mockTasks = [
      {
        id: "1",
        name: "Task 1",
        alt_code: "T1",
        created_at: "2023-01-01T00:00:00.000Z",
        user_id: "",
        is_favorite: true,
      },
      {
        id: "2",
        name: "Task 2",
        alt_code: "T1",
        created_at: "2023-01-01T00:00:00.000Z",
        user_id: "",
        is_favorite: true,
      },
      {
        id: "3",
        name: "Task 3",
        alt_code: "T3",
        created_at: "2023-01-01T00:00:00.000Z",
        user_id: "",
        is_favorite: true,
      },
    ];

    const store = useFavoriteTasksStore();
    const tasksStore = useTasksStore();
    for (const t of mockTasks) {
      tasksStore.put(t);
    }
    expect(store.favorites).toHaveLength(0);

    await store.removeFavorite(mockTasks[1]);
    expect(store.favorites).toHaveLength(0);
    expect(store.favorites).not.toContainEqual(mockTasks[1]);
  });

  it("should toggle a task in favorites list - adding when not present", async () => {
    const mockTask = {
      id: "1",
      name: "Task 1",
      alt_code: "T1",
      created_at: "2023-01-01T00:00:00.000Z",
      user_id: "",
      is_favorite: true,
    };
    vi.mocked(updateTask).mockResolvedValue(true);

    const store = useFavoriteTasksStore();
    const tasksStore = useTasksStore();
    tasksStore.put(mockTask);
    expect(store.favorites).toHaveLength(0);

    await store.toggle(mockTask);
    expect(store.favorites).toContainEqual(mockTask);
    expect(store.favorites).toHaveLength(1);
  });

  it("should toggle a task in favorites list - removing when present", async () => {
    const mockTask = {
      id: "1",
      name: "Task 1",
      alt_code: "T1",
      created_at: "2023-01-01T00:00:00.000Z",
      user_id: "",
      is_favorite: true,
    };
    vi.mocked(updateTask).mockResolvedValue(true);

    const store = useFavoriteTasksStore();
    const tasksStore = useTasksStore();
    tasksStore.put(mockTask);
    await store.addFavorite(mockTask);
    expect(store.favorites).toHaveLength(1);

    await store.toggle(mockTask);
    expect(store.favorites).not.toContainEqual(mockTask);
    expect(store.favorites).toHaveLength(0);
  });

  it("should clear all favorites", async () => {
    const mockTasks = [
      {
        id: "1",
        name: "Task 1",
        alt_code: "T1",
        created_at: "2023-01-01T00:00:00.000Z",
        user_id: "",
        is_favorite: true,
      },
      {
        id: "2",
        name: "Task 2",
        alt_code: "T2",
        created_at: "2023-01-01T00:00:00.000Z",
        user_id: "",
        is_favorite: true,
      },
    ];

    vi.mocked(updateTask).mockResolvedValue(true);
    const store = useFavoriteTasksStore();
    const tasksStore = useTasksStore();
    for (const t of mockTasks) {
      tasksStore.put(t);
      await store.addFavorite(t);
    }

    expect(store.favorites).toHaveLength(mockTasks.length);

    store.clear();
    expect(store.favorites).toHaveLength(0);
  });
});
