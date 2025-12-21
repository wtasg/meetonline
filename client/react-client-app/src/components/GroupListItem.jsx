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
            <div className="card p-2">
                <div className="list-item__title">{group.groupName}</div>
                <div className="list-item__meta">
                    Created: {formatDate(group.createdAt)}
                </div>
            </div>
        );
    }

    // Authenticated user can see full details
    return (
        <div className="card">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="clickable flex gap-2"
            >
                <div>{isExpanded ? "[-]" : "[+]"}</div> <div className="list-item__title">{group.groupName}</div>
            </div>
            <div className="text-muted text-sm">
                Created: {formatDate(group.createdAt)}
            </div>
            {isExpanded && (
                <div className="vflex gap-1 mt-2 px-3">
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
