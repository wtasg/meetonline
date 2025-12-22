import { useState } from "react";
import "./AttendanceMarker.css";

/**
 * Component for marking event attendance with a token.
 * @param {object} props
 * @param {string} props.eventId - The event ID
 * @param {function} props.onMarkAttendance - Callback: (phase, token) => Promise
 * @param {object} props.attendanceStatus - Current attendance status
 * @param {boolean} props.isOrganizer - Whether current user is the organizer
 * @param {function} props.onInitAttendance - Callback to initialize attendance (organizer only)
 */
function AttendanceMarker({
    onMarkAttendance,
    attendanceStatus,
    isOrganizer = false,
    onInitAttendance,
}) {
    const [token, setToken] = useState("");
    const [selectedPhase, setSelectedPhase] = useState("start");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' | 'error'

    const phases = [
        { key: "start", label: "Start", emoji: "🚀" },
        { key: "mid", label: "Mid", emoji: "⏳" },
        { key: "end", label: "End", emoji: "🏁" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token.trim()) {
            setMessage("Please enter a token");
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const result = await onMarkAttendance(selectedPhase, token.trim());
            if (result.ok) {
                setMessage(`Attendance marked for ${selectedPhase}! Score: ${result.data?.score || 0}/3`);
                setMessageType("success");
                setToken("");
            } else {
                setMessage(result.message || "Failed to mark attendance");
                setMessageType("error");
            }
        } catch {
            setMessage("An error occurred");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    const handleInit = async () => {
        if (!onInitAttendance) return;
        setLoading(true);
        setMessage("");

        try {
            const result = await onInitAttendance();
            if (result.ok) {
                setMessage("Attendance tokens generated!");
                setMessageType("success");
            } else {
                setMessage(result.message || "Failed to initialize attendance");
                setMessageType("error");
            }
        } catch {
            setMessage("An error occurred");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="attendance-marker">
            <h4 className="attendance-marker__title">📍 Mark Attendance</h4>

            {isOrganizer && (
                <div className="attendance-marker__organizer-section">
                    <button
                        onClick={handleInit}
                        disabled={loading}
                        className="attendance-marker__init-btn"
                    >
                        {loading ? "Generating..." : "Generate Attendance Tokens"}
                    </button>
                    {attendanceStatus && (
                        <div className="attendance-marker__tokens">
                            <p className="attendance-marker__tokens-title">Share these tokens:</p>
                            <div className="attendance-marker__token-list">
                                <div className="attendance-marker__token-item">
                                    <span className="attendance-marker__token-label">Start:</span>
                                    <code className="attendance-marker__token-value">
                                        {attendanceStatus.startToken || "Not generated"}
                                    </code>
                                </div>
                                <div className="attendance-marker__token-item">
                                    <span className="attendance-marker__token-label">Mid:</span>
                                    <code className="attendance-marker__token-value">
                                        {attendanceStatus.midToken || "Not generated"}
                                    </code>
                                </div>
                                <div className="attendance-marker__token-item">
                                    <span className="attendance-marker__token-label">End:</span>
                                    <code className="attendance-marker__token-value">
                                        {attendanceStatus.endToken || "Not generated"}
                                    </code>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="attendance-marker__form">
                <div className="attendance-marker__phases">
                    {phases.map((phase) => (
                        <button
                            key={phase.key}
                            type="button"
                            onClick={() => setSelectedPhase(phase.key)}
                            className={`attendance-marker__phase-btn ${selectedPhase === phase.key ? "attendance-marker__phase-btn--active" : ""}`}
                        >
                            <span className="attendance-marker__phase-emoji">{phase.emoji}</span>
                            <span className="attendance-marker__phase-label">{phase.label}</span>
                        </button>
                    ))}
                </div>

                <div className="attendance-marker__input-group">
                    <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Enter attendance token..."
                        className="attendance-marker__input"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !token.trim()}
                        className="attendance-marker__submit-btn"
                    >
                        {loading ? "Marking..." : "Mark"}
                    </button>
                </div>
            </form>

            {message && (
                <div className={`attendance-marker__message attendance-marker__message--${messageType}`}>
                    {message}
                </div>
            )}

            {attendanceStatus?.userScore !== undefined && (
                <div className="attendance-marker__score">
                    <span className="attendance-marker__score-label">Your attendance score:</span>
                    <span className="attendance-marker__score-value">
                        {attendanceStatus.userScore}/3
                    </span>
                </div>
            )}
        </div>
    );
}

export { AttendanceMarker };
