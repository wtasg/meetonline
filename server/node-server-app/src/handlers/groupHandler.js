import {
    createGroup,
    getGroupById,
    getGroupsByUserProfileId,
    searchGroupsByName,
    updateGroup,
    deleteGroup,
    addGroupMember,
    removeGroupMember,
} from "../database/group.js";
import { GroupModel } from "../models/groupModel.js";
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";
import { getUserProfileByUsername } from "../database/user_profile.js";

/**
 * Setup group handlers
 * @param {Express} app
 */
function setupGroupHandler(app) {
    app.post("/group", hybridAuthMiddleware, groupPOST);
    app.get("/group/search", hybridAuthMiddleware, groupSearchGET);
    app.get("/group/:id", hybridAuthMiddleware, groupGET);
    app.get("/groups", hybridAuthMiddleware, groupsGET);
    app.patch("/group/:id", hybridAuthMiddleware, groupPATCH);
    app.delete("/group/:id", hybridAuthMiddleware, groupDELETE);
    app.post("/group/:id/join", hybridAuthMiddleware, groupJoinPOST);
    app.post("/group/:id/leave", hybridAuthMiddleware, groupLeavePOST);
}

/**
 * Create a new group
 */
async function groupPOST(req, res) {
    try {
        const { groupName, description, isPublic, tags, categories } = req.body;

        // User is authenticated via hybrid middleware
        const username = req.user?.username;

        if (!groupName || !groupName.trim()) {
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Group name is required and cannot be empty."
            });
        }

        const userProfile = await getUserProfileByUsername(username);
        if (userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Cannot fetch user profile."
            });
        }

        const group = await createGroup({
            userProfileId: userProfile.id,
            groupName,
            description: description || "",
            isPublic: isPublic !== false,
            tags: tags || "",
            categories: categories || "",
        });

        if (group.__isNull) {
            return res.status(500).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Failed to create group."
            });
        }

        return res.status(201).json({
            ok: true,
            group: group.toClient(),
            message: "Group created successfully."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            group: GroupModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Get a group by ID
 */
async function groupGET(req, res) {
    try {
        const { id } = req.params;

        // User is authenticated via hybrid middleware (checking mainly for side-effects or if we want to restrict visibility later)
        // Currently just need auth to proceed.

        const group = await getGroupById(id);
        if (group.__isNull) {
            return res.status(404).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Group not found."
            });
        }

        return res.status(200).json({
            ok: true,
            group: group.toClient(),
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            group: GroupModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Get groups by user
 */
async function groupsGET(req, res) {
    try {
        const username = req.user?.username;

        const userProfile = await getUserProfileByUsername(username);
        if (userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                groups: [],
                message: "Cannot fetch user profile."
            });
        }

        const groups = await getGroupsByUserProfileId(userProfile.id);

        return res.status(200).json({
            ok: true,
            groups: groups.map(g => g.toClient()),
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            groups: [],
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Update a group
 */
async function groupPATCH(req, res) {
    try {
        const { id } = req.params;
        const clientUpdates = req.body;

        const username = req.user?.username;

        const userProfile = await getUserProfileByUsername(username);
        if (userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Cannot fetch user profile."
            });
        }

        const existingGroup = await getGroupById(id);
        if (existingGroup.__isNull) {
            return res.status(404).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Group not found."
            });
        }

        if (String(existingGroup.userProfileId) !== String(userProfile.id)) {
            return res.status(403).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Not authorized to update this group."
            });
        }

        // Convert camelCase to snake_case for database
        const dbUpdates = {};
        if (clientUpdates.groupName !== undefined) dbUpdates.group_name = clientUpdates.groupName;
        if (clientUpdates.description !== undefined) dbUpdates.description = clientUpdates.description;
        if (clientUpdates.isPublic !== undefined) dbUpdates.is_public = clientUpdates.isPublic;
        if (clientUpdates.tags !== undefined) dbUpdates.tags = clientUpdates.tags;
        if (clientUpdates.categories !== undefined) dbUpdates.categories = clientUpdates.categories;
        if (clientUpdates.isHidden !== undefined) dbUpdates.is_hidden = clientUpdates.isHidden;
        if (clientUpdates.isArchived !== undefined) dbUpdates.is_archived = clientUpdates.isArchived;

        const group = await updateGroup(id, dbUpdates);
        if (group.__isNull) {
            return res.status(500).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Failed to update group."
            });
        }

        return res.status(200).json({
            ok: true,
            group: group.toClient(),
            message: "Group updated successfully."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            group: GroupModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Delete a group
 */
async function groupDELETE(req, res) {
    try {
        const { id } = req.params;

        const username = req.user?.username;

        const userProfile = await getUserProfileByUsername(username);
        if (userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                message: "Cannot fetch user profile."
            });
        }

        const existingGroup = await getGroupById(id);
        if (existingGroup.__isNull) {
            return res.status(404).json({
                ok: false,
                message: "Group not found."
            });
        }

        if (String(existingGroup.userProfileId) !== String(userProfile.id)) {
            return res.status(403).json({
                ok: false,
                message: "Not authorized to delete this group."
            });
        }

        const success = await deleteGroup(id);
        if (!success) {
            return res.status(500).json({
                ok: false,
                message: "Failed to delete group."
            });
        }

        return res.status(200).json({
            ok: true,
            message: "Group deleted successfully."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Join a group
 */
async function groupJoinPOST(req, res) {
    try {
        const { id } = req.params;

        const username = req.user?.username;

        const userProfile = await getUserProfileByUsername(username);
        if (userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Cannot fetch user profile."
            });
        }

        // Check if group exists and is public
        const existingGroup = await getGroupById(id);
        if (existingGroup.__isNull) {
            return res.status(404).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Group not found."
            });
        }

        if (!existingGroup.isPublic) {
            return res.status(403).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Cannot join a private group."
            });
        }

        const group = await addGroupMember(id, String(userProfile.id));
        if (group.__isNull) {
            return res.status(500).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Failed to join group."
            });
        }

        return res.status(200).json({
            ok: true,
            group: group.toClient(),
            message: "Joined group successfully."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            group: GroupModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Leave a group
 */
async function groupLeavePOST(req, res) {
    try {
        const { id } = req.params;

        const username = req.user?.username;

        const userProfile = await getUserProfileByUsername(username);
        if (userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Cannot fetch user profile."
            });
        }

        const group = await removeGroupMember(id, String(userProfile.id));
        if (group.__isNull) {
            return res.status(500).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Failed to leave group."
            });
        }

        return res.status(200).json({
            ok: true,
            group: group.toClient(),
            message: "Left group successfully."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            group: GroupModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Search groups
 */
async function groupSearchGET(req, res) {
    try {
        const { q } = req.query;
        // Auth check via middleware done to sure access rights if needed
        // const username = req.user?.username;

        if (!q) {
            return res.status(400).json({
                ok: false,
                groups: [],
                message: "Search term is required."
            });
        }

        const groups = await searchGroupsByName(q);

        return res.status(200).json({
            ok: true,
            groups: groups.map(g => g.toClient()),
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            groups: [],
            message: "CAUGHT ERROR."
        });
    }
}

export { setupGroupHandler };
