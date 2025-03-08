import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useTagsStore } from "../tags";
import { getTags, createTag, deleteTag } from "../../common/supabaseClient";
import type { Tag } from "../../common/types";

vi.mock("../../common/supabaseClient", () => ({
  getTags: vi.fn(),
  createTag: vi.fn(),
  deleteTag: vi.fn(),
}));

describe("tags store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should initialize as empty array", () => {
    const store = useTagsStore();
    expect(store.tags).toEqual([]);
  });

  it("loadTags updates tags when data is returned", async () => {
    const mockTags: Tag[] = [
      { id: "1", name: "Test Tag", user_id: "", created_at: "" },
    ];
    vi.mocked(getTags).mockResolvedValue(mockTags);

    const store = useTagsStore();
    await store.loadTags();

    expect(store.tags).toEqual(mockTags);
  });

  it("addTag adds new tag to store when creation succeeds", async () => {
    const newTag = { id: "1", name: "Test Tag", user_id: "", created_at: "" };
    vi.mocked(createTag).mockResolvedValue(newTag);

    const store = useTagsStore();
    await store.addTag(newTag);

    expect(store.tags).toContainEqual(newTag);
  });

  it("removeTag removes tag from store when deletion succeeds", async () => {
    const mockTags: Tag[] = [
      { id: "1", name: "Test Tag", user_id: "", created_at: "" },
    ];
    const store = useTagsStore();
    store.tags = [...mockTags];
    vi.mocked(deleteTag).mockResolvedValue(true);

    await store.removeTag("1");

    expect(store.tags).toEqual([]);
  });

  it("does not modify tags when operations fail", async () => {
    const store = useTagsStore();
    const mockTags: Tag[] = [
      { id: "1", name: "Test Tag", user_id: "", created_at: "" },
    ];
    store.tags = [...mockTags];

    vi.mocked(createTag).mockResolvedValue(null);
    await store.addTag({
      id: "2",
      name: "New Tag",
      user_id: "",
      created_at: "",
    });
    expect(store.tags).toEqual(mockTags);

    vi.mocked(deleteTag).mockResolvedValue(false);
    await store.removeTag("1");
    expect(store.tags).toEqual(mockTags);
  });
});
