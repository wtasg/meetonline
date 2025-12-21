import { useState, useEffect } from "react";
import { SocialLoginButtons } from "../components/SocialLoginButtons";
import { loadOAuthConnectionsAction, disconnectOAuthAction } from "../actions/oauthActions";

function ConnectedAccounts() {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadConnections = async () => {
        try {
            const data = await loadOAuthConnectionsAction();
            setConnections(data);
        } catch (error) {
            console.error("Error loading connections:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConnections();
    }, []);

    const handleDisconnect = async (provider) => {
        if (!confirm(`Are you sure you want to disconnect your ${provider} account?`)) return;
        try {
            const success = await disconnectOAuthAction(provider);
            if (success) {
                loadConnections();
            }
        } catch (error) {
            console.error("Error disconnecting:", error);
        }
    };

    if (loading) return <div>Loading connections...</div>;

    return (
        <div className="vflex gap-3 mt-4">
            <h3 className="h4">Social Connections</h3>
            <p className="text-muted text-sm">Connect your social accounts to log in faster.</p>

            <div className="vflex gap-2">
                {connections.length > 0 ? (
                    connections.map(c => (
                        <div key={c.provider} className="flex sb vac p-2 b-solid b-1 rounded">
                            <div className="vflex">
                                <span className="font-bold capitalize">{c.provider}</span>
                                <span className="text-sm text-muted">{c.email}</span>
                            </div>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleDisconnect(c.provider)}
                            >
                                Disconnect
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="p-3 bg-muted rounded text-center">
                        <span className="text-muted">No social accounts connected.</span>
                    </div>
                )}
            </div>

            <SocialLoginButtons mode="connect" />
        </div>
    );
}

export { ConnectedAccounts };
