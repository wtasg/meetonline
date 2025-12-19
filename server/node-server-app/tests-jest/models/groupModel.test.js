import { GroupModel, updateGroup, groupKeyMap } from "../../src/models/groupModel.js";
import { describe, it, expect } from "@jest/globals";

describe("GroupModel", () => {
    describe("constructor", () => {
        it("creates a null instance by default", () => {
            const model = new GroupModel();
            expect(model.__isNull).toBe(true);
            expect(model.__isDefault).toBe(false);
            expect(model.id).toBeNull();
            expect(model.groupName).toBeNull();
        });
    });

    describe("fromDatabaseRow", () => {
        it("creates an instance from a valid database row", () => {
            const row = {
                id: "1",
                user_profile_id: "100",
                group_name: "Test Group",
                description: "Test Description",
                is_public: true,
                members: "[\"1\",\"2\"]",
                tags: "test,tags",
                categories: "category1",
                created_at: new Date("2024-01-01"),
                modified_at: new Date("2024-01-02"),
                is_deleted: false,
                deleted_at: null,
                is_hidden: false,
                is_archived: false,
            };

            const model = GroupModel.fromDatabaseRow(row);

            expect(model.__isNull).toBe(false);
            expect(model.__isDefault).toBe(false);
            expect(model.id).toBe("1");
            expect(model.userProfileId).toBe("100");
            expect(model.groupName).toBe("Test Group");
            expect(model.description).toBe("Test Description");
            expect(model.isPublic).toBe(true);
            expect(model.members).toBe("[\"1\",\"2\"]");
            expect(model.tags).toBe("test,tags");
            expect(model.categories).toBe("category1");
            expect(model.isDeleted).toBe(false);
            expect(model.deletedAt).toBe("");
            expect(model.isHidden).toBe(false);
            expect(model.isArchived).toBe(false);
        });

        it("throws an error when row is null", () => {
            expect(() => GroupModel.fromDatabaseRow(null)).toThrow("Invalid database row.");
        });

        it("throws an error when row is undefined", () => {
            expect(() => GroupModel.fromDatabaseRow(undefined)).toThrow("Invalid database row.");
        });

        it("handles null values in row with defaults", () => {
            const row = {
                id: null,
                user_profile_id: null,
                group_name: null,
                description: null,
                is_public: null,
                members: null,
                tags: null,
                categories: null,
                created_at: null,
                modified_at: null,
                is_deleted: null,
                deleted_at: null,
                is_hidden: null,
                is_archived: null,
            };

            const model = GroupModel.fromDatabaseRow(row);

            expect(model.id).toBe(0);
            expect(model.userProfileId).toBe(0);
            expect(model.groupName).toBe("");
            expect(model.description).toBe("");
            expect(model.isPublic).toBe(false);
            expect(model.members).toBe("");
            expect(model.tags).toBe("");
            expect(model.categories).toBe("");
            expect(model.deletedAt).toBe("");
        });
    });

    describe("null", () => {
        it("creates a null instance", () => {
            const model = GroupModel.null();
            expect(model.__isNull).toBe(true);
            expect(model.__isDefault).toBe(false);
        });
    });

    describe("default", () => {
        it("creates a default instance", () => {
            const model = GroupModel.default();
            expect(model.__isNull).toBe(false);
            expect(model.__isDefault).toBe(true);
            expect(model.id).toBe(0);
            expect(model.userProfileId).toBe(0);
            expect(model.groupName).toBe("default group");
            expect(model.description).toBe("");
            expect(model.isPublic).toBe(true);
            expect(model.members).toBe("");
            expect(model.tags).toBe("");
            expect(model.categories).toBe("");
            expect(model.isDeleted).toBe(false);
            expect(model.deletedAt).toBeNull();
            expect(model.isHidden).toBe(false);
            expect(model.isArchived).toBe(false);
        });
    });

    describe("toClient", () => {
        it("converts model to client-safe object", () => {
            const model = GroupModel.default();
            const clientObj = model.toClient();

            expect(clientObj.__isNull).toBeUndefined();
            expect(clientObj.__isDefault).toBeUndefined();
            expect(clientObj.id).toBe(0);
            expect(clientObj.groupName).toBe("default group");
        });
    });
});

describe("updateGroup", () => {
    it("updates group with new values", () => {
        const group = {
            id: "1",
            groupName: "Old Name",
            description: "Old Description",
            modifiedAt: "2024-01-01",
        };

        const updates = {
            groupName: "New Name",
            description: "New Description",
        };

        const updated = updateGroup(group, updates);

        expect(updated.groupName).toBe("New Name");
        expect(updated.description).toBe("New Description");
        expect(updated.modifiedAt).not.toBe("2024-01-01");
    });

    it("throws error for invalid group object", () => {
        expect(() => updateGroup(null, {})).toThrow("Invalid group object passed to updateGroup.");
        expect(() => updateGroup([], {})).toThrow("Invalid group object passed to updateGroup.");
        expect(() => updateGroup(undefined, {})).toThrow("Invalid group object passed to updateGroup.");
    });
});

describe("groupKeyMap", () => {
    it("maps camelCase to snake_case", () => {
        expect(groupKeyMap.userProfileId).toBe("user_profile_id");
        expect(groupKeyMap.groupName).toBe("group_name");
        expect(groupKeyMap.isPublic).toBe("is_public");
        expect(groupKeyMap.createdAt).toBe("created_at");
        expect(groupKeyMap.modifiedAt).toBe("modified_at");
        expect(groupKeyMap.isDeleted).toBe("is_deleted");
        expect(groupKeyMap.deletedAt).toBe("deleted_at");
        expect(groupKeyMap.isHidden).toBe("is_hidden");
        expect(groupKeyMap.isArchived).toBe("is_archived");
    });

    it("maps snake_case to camelCase", () => {
        expect(groupKeyMap.user_profile_id).toBe("userProfileId");
        expect(groupKeyMap.group_name).toBe("groupName");
        expect(groupKeyMap.is_public).toBe("isPublic");
        expect(groupKeyMap.created_at).toBe("createdAt");
        expect(groupKeyMap.modified_at).toBe("modifiedAt");
        expect(groupKeyMap.is_deleted).toBe("isDeleted");
        expect(groupKeyMap.deleted_at).toBe("deletedAt");
        expect(groupKeyMap.is_hidden).toBe("isHidden");
        expect(groupKeyMap.is_archived).toBe("isArchived");
    });

    it("maps identical keys to themselves", () => {
        expect(groupKeyMap.id).toBe("id");
        expect(groupKeyMap.description).toBe("description");
        expect(groupKeyMap.members).toBe("members");
        expect(groupKeyMap.tags).toBe("tags");
        expect(groupKeyMap.categories).toBe("categories");
    });
});
