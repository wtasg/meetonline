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
import { userSession } from "../utils/session.js";
import { getUserProfileByUsername } from "../database/user_profile.js";

/**
 * Setup group handlers
 * @param {Express} app
 */
function setupGroupHandler(app) {
    app.post("/group", groupPOST);
    app.get("/group/:id", groupGET);
    app.get("/groups", groupsGET);
    app.patch("/group/:id", groupPATCH);
    app.delete("/group/:id", groupDELETE);
    app.post("/group/:id/join", groupJoinPOST);
    app.post("/group/:id/leave", groupLeavePOST);
    app.get("/group/search", groupSearchGET);
}

/**
 * Create a new group
 */
async function groupPOST(req, res) {
    try {
        const { groupName, description, isPublic, tags, categories } = req.body;
        const { cookies } = req;
        
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Missing Cookie Headers."
            });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Missing Session."
            });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Invalid Session."
            });
        }

        if (!groupName) {
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Group name is required."
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
        const { cookies } = req;
        
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Missing Cookie Headers."
            });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Missing Session."
            });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Invalid Session."
            });
        }

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
        const { cookies } = req;
        
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                groups: [],
                message: "Missing Cookie Headers."
            });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({
                ok: false,
                groups: [],
                message: "Missing Session."
            });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({
                ok: false,
                groups: [],
                message: "Invalid Session."
            });
        }

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
        const updates = req.body;
        const { cookies } = req;
        
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Missing Cookie Headers."
            });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Missing Session."
            });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Invalid Session."
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

        const existingGroup = await getGroupById(id);
        if (existingGroup.__isNull) {
            return res.status(404).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Group not found."
            });
        }

        if (existingGroup.userProfileId !== userProfile.id) {
            return res.status(403).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Not authorized to update this group."
            });
        }

        const group = await updateGroup(id, updates);
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
        const { cookies } = req;
        
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                message: "Missing Cookie Headers."
            });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({
                ok: false,
                message: "Missing Session."
            });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({
                ok: false,
                message: "Invalid Session."
            });
        }

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

        if (existingGroup.userProfileId !== userProfile.id) {
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
        const { cookies } = req;
        
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Missing Cookie Headers."
            });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Missing Session."
            });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Invalid Session."
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
        const { cookies } = req;
        
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Missing Cookie Headers."
            });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Missing Session."
            });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({
                ok: false,
                group: GroupModel.null().toClient(),
                message: "Invalid Session."
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
        const { cookies } = req;
        
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                groups: [],
                message: "Missing Cookie Headers."
            });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({
                ok: false,
                groups: [],
                message: "Missing Session."
            });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({
                ok: false,
                groups: [],
                message: "Invalid Session."
            });
        }

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
