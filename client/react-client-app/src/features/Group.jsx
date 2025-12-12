import { useState, useEffect } from "react";
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
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        const response = await fetchGroups();
        if (response.ok) {
            setGroups(response.groups);
        } else {
            setMessage(response.message);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        const response = await createGroup(formData);
        if (response.ok) {
            setMessage("Group created successfully!");
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
            setMessage(response.message);
        }
    };

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        if (!selectedGroup) return;
        
        const updates = {};
        if (formData.groupName) updates.group_name = formData.groupName;
        if (formData.description) updates.description = formData.description;
        if (formData.isPublic !== undefined) updates.is_public = formData.isPublic;
        if (formData.tags) updates.tags = formData.tags;
        if (formData.categories) updates.categories = formData.categories;

        const response = await updateGroup(selectedGroup.id, updates);
        if (response.ok) {
            setMessage("Group updated successfully!");
            setIsEditing(false);
            setSelectedGroup(null);
            loadGroups();
        } else {
            setMessage(response.message);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!confirm("Are you sure you want to delete this group?")) return;
        
        const response = await deleteGroup(groupId);
        if (response.ok) {
            setMessage("Group deleted successfully!");
            loadGroups();
        } else {
            setMessage(response.message);
        }
    };

    const handleJoinGroup = async (groupId) => {
        const response = await joinGroup(groupId);
        if (response.ok) {
            setMessage("Joined group successfully!");
            loadGroups();
        } else {
            setMessage(response.message);
        }
    };

    const handleLeaveGroup = async (groupId) => {
        const response = await leaveGroup(groupId);
        if (response.ok) {
            setMessage("Left group successfully!");
            loadGroups();
        } else {
            setMessage(response.message);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;
        
        const response = await searchGroups(searchTerm);
        if (response.ok) {
            setSearchResults(response.groups);
            setMessage(`Found ${response.groups.length} groups`);
        } else {
            setMessage(response.message);
        }
    };

    const handleViewGroup = async (groupId) => {
        const response = await fetchGroup(groupId);
        if (response.ok) {
            setSelectedGroup(response.group);
            setIsSearching(false);
        } else {
            setMessage(response.message);
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
        <div className="group-container" style={{ padding: "20px" }}>
            <h1>Groups</h1>
            
            {message && (
                <div className="message" style={{ 
                    padding: "10px", 
                    marginBottom: "10px", 
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px"
                }}>
                    {message}
                </div>
            )}

            <div className="group-actions" style={{ marginBottom: "20px" }}>
                <button onClick={handleCreateClick}>Create Group</button>
                <button onClick={handleSearchClick} style={{ marginLeft: "10px" }}>Search Groups</button>
                <button onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setIsSearching(false);
                    setSelectedGroup(null);
                }} style={{ marginLeft: "10px" }}>View My Groups</button>
            </div>

            {isCreating && (
                <div className="create-group-form">
                    <h2>Create New Group</h2>
                    <form onSubmit={handleCreateGroup}>
                        <div style={{ marginBottom: "10px" }}>
                            <label>
                                Group Name:
                                <input
                                    type="text"
                                    value={formData.groupName}
                                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                    required
                                    style={{ marginLeft: "10px", padding: "5px" }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>
                                Description:
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ marginLeft: "10px", padding: "5px", width: "300px" }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                />
                                Public Group
                            </label>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>
                                Tags:
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    style={{ marginLeft: "10px", padding: "5px" }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>
                                Categories:
                                <input
                                    type="text"
                                    value={formData.categories}
                                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                                    style={{ marginLeft: "10px", padding: "5px" }}
                                />
                            </label>
                        </div>
                        <button type="submit">Create</button>
                        <button type="button" onClick={() => setIsCreating(false)} style={{ marginLeft: "10px" }}>Cancel</button>
                    </form>
                </div>
            )}

            {isEditing && selectedGroup && (
                <div className="edit-group-form">
                    <h2>Edit Group</h2>
                    <form onSubmit={handleUpdateGroup}>
                        <div style={{ marginBottom: "10px" }}>
                            <label>
                                Group Name:
                                <input
                                    type="text"
                                    value={formData.groupName}
                                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                    style={{ marginLeft: "10px", padding: "5px" }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>
                                Description:
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ marginLeft: "10px", padding: "5px", width: "300px" }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                />
                                Public Group
                            </label>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>
                                Tags:
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    style={{ marginLeft: "10px", padding: "5px" }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>
                                Categories:
                                <input
                                    type="text"
                                    value={formData.categories}
                                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                                    style={{ marginLeft: "10px", padding: "5px" }}
                                />
                            </label>
                        </div>
                        <button type="submit">Update</button>
                        <button type="button" onClick={() => {
                            setIsEditing(false);
                            setSelectedGroup(null);
                        }} style={{ marginLeft: "10px" }}>Cancel</button>
                    </form>
                </div>
            )}

            {isSearching && (
                <div className="search-groups">
                    <h2>Search Groups</h2>
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by group name"
                            style={{ padding: "5px", marginRight: "10px" }}
                        />
                        <button type="submit">Search</button>
                    </form>
                    <div className="search-results" style={{ marginTop: "20px" }}>
                        {searchResults.map((group) => (
                            <div key={group.id} style={{ 
                                padding: "10px", 
                                marginBottom: "10px", 
                                border: "1px solid #ddd",
                                borderRadius: "4px"
                            }}>
                                <h3>{group.groupName}</h3>
                                <p>{group.description}</p>
                                <button onClick={() => handleViewGroup(group.id)}>View</button>
                                <button onClick={() => handleJoinGroup(group.id)} style={{ marginLeft: "10px" }}>Join</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isCreating && !isEditing && !isSearching && (
                <div className="groups-list">
                    <h2>My Groups</h2>
                    {groups.length === 0 ? (
                        <p>No groups yet. Create one to get started!</p>
                    ) : (
                        <div>
                            {groups.map((group) => (
                                <div key={group.id} style={{ 
                                    padding: "10px", 
                                    marginBottom: "10px", 
                                    border: "1px solid #ddd",
                                    borderRadius: "4px"
                                }}>
                                    <h3>{group.groupName}</h3>
                                    <p>{group.description}</p>
                                    <p><strong>Public:</strong> {group.isPublic ? "Yes" : "No"}</p>
                                    <p><strong>Tags:</strong> {group.tags}</p>
                                    <p><strong>Categories:</strong> {group.categories}</p>
                                    <div>
                                        <button onClick={() => handleEditClick(group)}>Edit</button>
                                        <button onClick={() => handleDeleteGroup(group.id)} style={{ marginLeft: "10px" }}>Delete</button>
                                        <button onClick={() => handleLeaveGroup(group.id)} style={{ marginLeft: "10px" }}>Leave</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {selectedGroup && !isEditing && (
                <div className="group-details" style={{ 
                    marginTop: "20px", 
                    padding: "20px", 
                    border: "2px solid #333",
                    borderRadius: "4px"
                }}>
                    <h2>Group Details</h2>
                    <p><strong>Name:</strong> {selectedGroup.groupName}</p>
                    <p><strong>Description:</strong> {selectedGroup.description}</p>
                    <p><strong>Public:</strong> {selectedGroup.isPublic ? "Yes" : "No"}</p>
                    <p><strong>Tags:</strong> {selectedGroup.tags}</p>
                    <p><strong>Categories:</strong> {selectedGroup.categories}</p>
                    <p><strong>Created:</strong> {new Date(selectedGroup.createdAt).toLocaleString()}</p>
                    <button onClick={() => setSelectedGroup(null)}>Close</button>
                </div>
            )}
        </div>
    );
}

export default Group;
