import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
    createGroup,
    fetchGroups,
    fetchGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    searchGroups,
} from "../actions/groupActions.js";

const MESSAGE_STATE = {
    IDLE: "idle",
    SUCCESS: "success",
    SERVER_ERROR: "serverError",
    CLIENT_ERROR: "clientError"
};

function Group() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [formData, setFormData] = useState({
        groupName: "",
        description: "",
        isPublic: true,
        tags: "",
        categories: "",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState({ text: "", state: MESSAGE_STATE.IDLE });

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        const response = await fetchGroups();
        if (response.ok) {
            setGroups(response.groups);
            setMessage({ text: "", state: MESSAGE_STATE.IDLE });
        } else {
            setMessage({ text: response.message, state: MESSAGE_STATE.SERVER_ERROR });
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        const response = await createGroup(formData);
        if (response.ok) {
            setMessage({ text: "Group created successfully!", state: MESSAGE_STATE.SUCCESS });
            setFormData({
                groupName: "",
                description: "",
                isPublic: true,
                tags: "",
                categories: "",
            });
            setIsCreating(false);
            loadGroups();
        } else {
            setMessage({ text: response.message, state: MESSAGE_STATE.SERVER_ERROR });
        }
    };

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        if (!selectedGroup) return;

        const updates = {};
        if (formData.groupName !== undefined) updates.groupName = formData.groupName;
        if (formData.description !== undefined) updates.description = formData.description;
        if (formData.isPublic !== undefined) updates.isPublic = formData.isPublic;
        if (formData.tags !== undefined) updates.tags = formData.tags;
        if (formData.categories !== undefined) updates.categories = formData.categories;

        const response = await updateGroup(selectedGroup.id, updates);
        if (response.ok) {
            setMessage({ text: "Group updated successfully!", state: MESSAGE_STATE.SUCCESS });
            setIsEditing(false);
            setSelectedGroup(null);
            loadGroups();
        } else {
            setMessage({ text: response.message, state: MESSAGE_STATE.SERVER_ERROR });
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;

        const response = await deleteGroup(groupId);
        if (response.ok) {
            setMessage({ text: "Group deleted successfully!", state: MESSAGE_STATE.SUCCESS });
            loadGroups();
        } else {
            setMessage({ text: response.message, state: MESSAGE_STATE.SERVER_ERROR });
        }
    };

    const handleJoinGroup = async (groupId) => {
        const response = await joinGroup(groupId);
        if (response.ok) {
            setMessage({ text: "Joined group successfully!", state: MESSAGE_STATE.SUCCESS });
            loadGroups();
        } else {
            setMessage({ text: response.message, state: MESSAGE_STATE.SERVER_ERROR });
        }
    };

    const handleLeaveGroup = async (groupId) => {
        const response = await leaveGroup(groupId);
        if (response.ok) {
            setMessage({ text: "Left group successfully!", state: MESSAGE_STATE.SUCCESS });
            loadGroups();
        } else {
            setMessage({ text: response.message, state: MESSAGE_STATE.SERVER_ERROR });
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;

        const response = await searchGroups(searchTerm);
        if (response.ok) {
            setSearchResults(response.groups);
            setMessage({ text: `Found ${response.groups.length} groups`, state: MESSAGE_STATE.SUCCESS });
        } else {
            setMessage({ text: response.message, state: MESSAGE_STATE.SERVER_ERROR });
        }
    };

    const handleViewGroup = async (groupId) => {
        const response = await fetchGroup(groupId);
        if (response.ok) {
            setSelectedGroup(response.group);
            setIsSearching(false);
        } else {
            setMessage({ text: response.message, state: MESSAGE_STATE.SERVER_ERROR });
        }
    };

    const handleEditClick = (group) => {
        setSelectedGroup(group);
        setFormData({
            groupName: group.groupName,
            description: group.description,
            isPublic: group.isPublic,
            tags: group.tags,
            categories: group.categories,
        });
        setIsEditing(true);
        setIsCreating(false);
    };

    const handleCreateClick = () => {
        setIsCreating(true);
        setIsEditing(false);
        setIsSearching(false);
        setSelectedGroup(null);
        setFormData({
            groupName: "",
            description: "",
            isPublic: true,
            tags: "",
            categories: "",
        });
    };

    const handleSearchClick = () => {
        setIsSearching(true);
        setIsCreating(false);
        setIsEditing(false);
        setSelectedGroup(null);
    };

    return (
        <div className="flex hac vacp">
            <div className="vflex">
                <h1>Groups</h1>

                {message.state !== MESSAGE_STATE.IDLE && (
                    <div className={message.state === MESSAGE_STATE.SUCCESS ? "success-message" : "error-message"} style={{
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "4px",
                        border: "1px solid",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        {message.state === MESSAGE_STATE.SUCCESS ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <div className="group-actions flex">
                    <button onClick={handleCreateClick}>Create Group</button>
                    <button onClick={handleSearchClick}>Search Groups</button>
                    <button onClick={() => {
                        setIsCreating(false);
                        setIsEditing(false);
                        setIsSearching(false);
                        setSelectedGroup(null);
                    }}>View My Groups</button>
                </div>

                {isCreating && (
                    <div className="create-group-form vflex">
                        <h2>Create New Group</h2>
                        <form onSubmit={handleCreateGroup} className="vflex">
                            <div className="vflex">
                                <div className="w30p">Group Name</div>
                                <div>
                                    <input
                                        className="w60p"
                                        type="text"
                                        value={formData.groupName}
                                        onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="vflex">
                                <div className="w30p">Description</div>
                                <div>
                                    <textarea
                                        className="w60p"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <div className="vflex">
                                <label className="flex vac">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                    />
                                    Public Group
                                </label>
                            </div>
                            <div className="vflex">
                                <div className="w30p">Tags</div>
                                <div>
                                    <input
                                        className="w60p"
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="vflex">
                                <div className="w30p">Categories</div>
                                <div>
                                    <input
                                        className="w60p"
                                        type="text"
                                        value={formData.categories}
                                        onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex">
                                <button type="submit">Create</button>
                                <button type="button" onClick={() => setIsCreating(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {isEditing && selectedGroup && (
                    <div className="edit-group-form vflex">
                        <h2>Edit Group</h2>
                        <form onSubmit={handleUpdateGroup} className="vflex">
                            <div className="vflex">
                                <div className="w30p">Group Name</div>
                                <div>
                                    <input
                                        className="w60p"
                                        type="text"
                                        value={formData.groupName}
                                        onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="vflex">
                                <div className="w30p">Description</div>
                                <div>
                                    <textarea
                                        className="w60p"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <div className="vflex">
                                <label className="flex vac">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                    />
                                    Public Group
                                </label>
                            </div>
                            <div className="vflex">
                                <div className="w30p">Tags</div>
                                <div>
                                    <input
                                        className="w60p"
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="vflex">
                                <div className="w30p">Categories</div>
                                <div>
                                    <input
                                        className="w60p"
                                        type="text"
                                        value={formData.categories}
                                        onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex">
                                <button type="submit">Update</button>
                                <button type="button" onClick={() => {
                                    setIsEditing(false);
                                    setSelectedGroup(null);
                                }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {isSearching && (
                    <div className="search-groups vflex">
                        <h2>Search Groups</h2>
                        <form onSubmit={handleSearch} className="vflex">
                            <div className="vflex">
                                <div className="w30p">Search Term</div>
                                <div>
                                    <input
                                        className="w60p"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by group name"
                                    />
                                </div>
                            </div>
                            <div>
                                <button type="submit">Search</button>
                            </div>
                        </form>
                        <div className="search-results vflex">
                            {searchResults.map((group) => (
                                <div key={group.id} className="box vflex">
                                    <h3>{group.groupName}</h3>
                                    <p>{group.description}</p>
                                    <div className="flex">
                                        <button onClick={() => handleViewGroup(group.id)}>View</button>
                                        <button onClick={() => handleJoinGroup(group.id)}>Join</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!isCreating && !isEditing && !isSearching && (
                    <div className="groups-list vflex">
                        <h2>My Groups</h2>
                        {groups.length === 0 ? (
                            <p>No groups yet. Create one to get started!</p>
                        ) : (
                            <div className="vflex">
                                {groups.map((group) => (
                                    <div key={group.id} className="box vflex">
                                        <h3>{group.groupName}</h3>
                                        <p>{group.description}</p>
                                        <div className="vflex">
                                            <div><strong>Public:</strong> {group.isPublic ? "Yes" : "No"}</div>
                                            <div><strong>Tags:</strong> {group.tags}</div>
                                            <div><strong>Categories:</strong> {group.categories}</div>
                                        </div>
                                        <div className="flex">
                                            <button onClick={() => handleEditClick(group)}>Edit</button>
                                            <button onClick={() => handleDeleteGroup(group.id)}>Delete</button>
                                            <button onClick={() => handleLeaveGroup(group.id)}>Leave</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {selectedGroup && !isEditing && (
                    <div className="group-details box vflex">
                        <h2>Group Details</h2>
                        <div className="vflex">
                            <div><strong>Name:</strong> {selectedGroup.groupName}</div>
                            <div><strong>Description:</strong> {selectedGroup.description}</div>
                            <div><strong>Public:</strong> {selectedGroup.isPublic ? "Yes" : "No"}</div>
                            <div><strong>Tags:</strong> {selectedGroup.tags}</div>
                            <div><strong>Categories:</strong> {selectedGroup.categories}</div>
                            <div><strong>Created:</strong> {new Date(selectedGroup.createdAt).toLocaleString()}</div>
                        </div>
                        <div>
                            <button onClick={() => setSelectedGroup(null)}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Group;
