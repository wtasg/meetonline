import { useState } from "react";

/**
 * GroupListItem - Display a single group in a list
 * @param {object} props
 * @param {object} props.group - Group data (minimal or full)
 * @param {boolean} props.isAuthenticated - Whether user is authenticated
 * @param {boolean} props.isMinimal - Whether displaying minimal info only
 */
function GroupListItem({ group, isAuthenticated, isMinimal }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    if (isMinimal || !isAuthenticated) {
        // Show minimal info (name + created date)
        return (
            <div className="group-list-item" style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>
                <div style={{ fontWeight: "bold" }}>{group.groupName}</div>
                <div style={{ fontSize: "0.9em", color: "#666" }}>
                    Created: {formatDate(group.createdAt)}
                </div>
            </div>
        );
    }

    // Authenticated user can see full details
    return (
        <div className="group-list-item" style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>
            <div 
                onClick={() => setIsExpanded(!isExpanded)} 
                style={{ cursor: "pointer", fontWeight: "bold" }}
            >
                {group.groupName} {isExpanded ? "▼" : "▶"}
            </div>
            <div style={{ fontSize: "0.9em", color: "#666" }}>
                Created: {formatDate(group.createdAt)}
            </div>
            {isExpanded && (
                <div style={{ marginTop: "8px", paddingLeft: "16px" }}>
                    {group.description && (
                        <div><strong>Description:</strong> {group.description}</div>
                    )}
                    <div><strong>Public:</strong> {group.isPublic ? "Yes" : "No"}</div>
                    {group.tags && (
                        <div><strong>Tags:</strong> {group.tags}</div>
                    )}
                    {group.categories && (
                        <div><strong>Categories:</strong> {group.categories}</div>
                    )}
                    {group.members && (
                        <div><strong>Members:</strong> {group.members}</div>
                    )}
                </div>
            )}
        </div>
    );
}

export { GroupListItem };
