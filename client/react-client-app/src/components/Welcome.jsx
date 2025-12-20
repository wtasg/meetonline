import { useState, useEffect } from "react";
import { useSession } from "../hooks/useSession";
import { fetchNewEvents, fetchUserNewEvents } from "../actions/eventActions";
import { fetchNewGroups, fetchUserNewGroups } from "../actions/groupActions";
import { EventListItem } from "../components/EventListItem";
import { GroupListItem } from "../components/GroupListItem";

function Welcome() {
    const { hasSession } = useSession();
    const [events, setEvents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                if (hasSession) {
                    // Fetch full details for authenticated users
                    const [eventsResult, groupsResult] = await Promise.all([
                        fetchUserNewEvents(),
                        fetchUserNewGroups()
                    ]);

                    if (eventsResult.ok) {
                        setEvents(eventsResult.user_new_events || []);
                    } else {
                        console.error("Failed to fetch events:", eventsResult.message);
                    }

                    if (groupsResult.ok) {
                        setGroups(groupsResult.user_new_groups || []);
                    } else {
                        console.error("Failed to fetch groups:", groupsResult.message);
                    }
                } else {
                    // Fetch minimal info for unauthenticated users
                    const [eventsResult, groupsResult] = await Promise.all([
                        fetchNewEvents(),
                        fetchNewGroups()
                    ]);

                    if (eventsResult.ok) {
                        setEvents(eventsResult.new_events || []);
                    } else {
                        console.error("Failed to fetch events:", eventsResult.message);
                    }

                    if (groupsResult.ok) {
                        setGroups(groupsResult.new_groups || []);
                    } else {
                        console.error("Failed to fetch groups:", groupsResult.message);
                    }
                }
            } catch (err) {
                console.error("Error loading data:", err);
                setError("Failed to load latest events and groups");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [hasSession]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div style={{ color: "red" }}>Error: {error}</div>;
    }

    return (
        <div style={{ padding: "16px" }}>
            <h1>Welcome to MeetOnline!</h1>
            
            <section style={{ marginTop: "24px" }}>
                <h2>Latest Events</h2>
                {events.length === 0 ? (
                    <p>No events yet.</p>
                ) : (
                    <div>
                        {events.map((event) => (
                            <EventListItem
                                key={event.id}
                                event={event}
                                isAuthenticated={hasSession}
                                isMinimal={!hasSession}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section style={{ marginTop: "24px" }}>
                <h2>Latest Groups</h2>
                {groups.length === 0 ? (
                    <p>No groups yet.</p>
                ) : (
                    <div>
                        {groups.map((group) => (
                            <GroupListItem
                                key={group.id}
                                group={group}
                                isAuthenticated={hasSession}
                                isMinimal={!hasSession}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export { Welcome };
