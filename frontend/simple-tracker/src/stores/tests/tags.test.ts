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
    await store.addTag(newTag.name);

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
    await store.addTag("New tag");
    expect(store.tags).toEqual(mockTags);

    vi.mocked(deleteTag).mockResolvedValue(false);
    await store.removeTag("1");
    expect(store.tags).toEqual(mockTags);
  });

  it("should do nothing on remove of a tag that its not present", async () => {
    const store = useTagsStore();
    vi.mocked(deleteTag).mockResolvedValue(true);
    await store.removeTag("test");
    expect(store.tags).toEqual([]);
  });

  it("should not add duplicate tags", async () => {
    const mockTag = {
      id: "2",
      name: "New Tag",
      user_id: "",
      created_at: "",
    };
    vi.mocked(createTag).mockResolvedValue(mockTag);
    const store = useTagsStore();
    store.tags = [mockTag];
    await store.addTag(mockTag.name);
    expect(store.tags).toHaveLength(1);
  });

  it("getTagById returns the correct tag", () => {
    const mockTags: Tag[] = [
      { id: "1", name: "Tag 1", user_id: "", created_at: "" },
      { id: "2", name: "Tag 2", user_id: "", created_at: "" },
    ];
    const store = useTagsStore();
    store.tags = [...mockTags];

    const foundTag = store.getTagById("1");
    expect(foundTag).toEqual(mockTags[0]);
  });

  it("getTagById returns undefined if tag not found", () => {
    const mockTags: Tag[] = [
      { id: "1", name: "Tag 1", user_id: "", created_at: "" },
    ];
    const store = useTagsStore();
    store.tags = [...mockTags];

    const foundTag = store.getTagById("non-existent-id");
    expect(foundTag).toBeUndefined();
  });
});
