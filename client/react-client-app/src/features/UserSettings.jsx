import { useState, useEffect } from "react";
import {
    fetchUserSettings,
    updateFontSize,
    updateFontContrast,
    updateNotifications,
    updateOnlinePresence,
    updateSounds,
    updateTheme,
    updateScheme,
    updateFilter
} from "../actions/userSettingsActions.js";
import { ServiceError } from "../components/Error.jsx";
import { resetLocation, resetUserSession } from "../session.js";
import { applyFontSize, applyFontContrast } from "../utils/settings.js";
import { applyTheme, applyScheme, applyFilter } from "../utils/theme.js";

const FONT_SIZES = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "x-large", label: "Extra Large" }
];

const FONT_CONTRASTS = [
    { value: "low", label: "Low" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High" }
];

const THEMES = [
    { value: "gray", label: "Gray" },
    { value: "teal", label: "Teal" },
    { value: "pink", label: "Pink" }
];

const SCHEMES = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "high-contrast", label: "High Contrast" }
];

const FILTERS = [
    { value: "default", label: "Default" },
    { value: "natural", label: "Natural" },
    { value: "vivid", label: "Vivid" },
    { value: "muted", label: "Muted" }
];

const VALID_FONT_SIZES = FONT_SIZES.map(f => f.value);
const VALID_FONT_CONTRASTS = FONT_CONTRASTS.map(f => f.value);
const VALID_THEMES = THEMES.map(t => t.value);
const VALID_SCHEMES = SCHEMES.map(s => s.value);
const VALID_FILTERS = FILTERS.map(f => f.value);

function validateSettings(settings) {
    return {
        theme: VALID_THEMES.includes(settings?.theme) ? settings.theme : "gray",
        scheme: VALID_SCHEMES.includes(settings?.scheme) ? settings.scheme : "light",
        filter: VALID_FILTERS.includes(settings?.filter) ? settings.filter : "default",
        fontSize: VALID_FONT_SIZES.includes(settings?.fontSize) ? settings.fontSize : "medium",
        fontFamily: typeof settings?.fontFamily === "string" ? settings.fontFamily : "system-ui",
        fontContrast: VALID_FONT_CONTRASTS.includes(settings?.fontContrast) ? settings.fontContrast : "normal",
        notifications: typeof settings?.notifications === "boolean" ? settings.notifications : true,
        onlinePresence: typeof settings?.onlinePresence === "boolean" ? settings.onlinePresence : true,
        sounds: typeof settings?.sounds === "boolean" ? settings.sounds : true
    };
}

function UserSettings({ isOpen, onClose }) {
    const [serviceError, setServiceError] = useState({ hasError: false, message: "" });
    const [settings, setSettings] = useState({
        theme: "gray",
        scheme: "light",
        filter: "default",
        fontSize: "medium",
        fontFamily: "system-ui",
        fontContrast: "normal",
        notifications: true,
        onlinePresence: true,
        sounds: true
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;

        (async function () {
            try {
                setIsLoading(true);
                const result = await fetchUserSettings();
                if (!isMounted) return;

                if (!result.ok) {
                    const sessionErrorMessages = [
                        "Missing Cookie Headers.",
                        "Missing Session.",
                        "Invalid Session.",
                    ];

                    if (sessionErrorMessages.includes(result.message)) {
                        resetUserSession();
                        resetLocation();
                    }
                    return;
                }

                const validatedSettings = validateSettings(result.user_settings);
                setSettings(validatedSettings);

                // Apply settings
                applyTheme(validatedSettings.theme);
                applyScheme(validatedSettings.scheme);
                applyFilter(validatedSettings.filter);
                applyFontSize(validatedSettings.fontSize);
                applyFontContrast(validatedSettings.fontContrast);

            } catch (error) {
                console.log({ error });
                if (isMounted) {
                    setServiceError({ hasError: true, message: "Unexpected Error" });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        })();

        return () => { isMounted = false; };
    }, [isOpen]);

    async function handleSettingChange(key, value) {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        // Apply the change immediately for visual feedback
        if (key === "theme") {
            applyTheme(value);
            await updateTheme(value);
        } else if (key === "scheme") {
            applyScheme(value);
            await updateScheme(value);
        } else if (key === "filter") {
            applyFilter(value);
            await updateFilter(value);
        } else if (key === "fontSize") {
            applyFontSize(value);
            await updateFontSize(value);
        } else if (key === "fontContrast") {
            applyFontContrast(value);
            await updateFontContrast(value);
        } else if (key === "notifications") {
            await updateNotifications(value);
        } else if (key === "onlinePresence") {
            await updateOnlinePresence(value);
        } else if (key === "sounds") {
            await updateSounds(value);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="settings-modal-overlay overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header flex sb vac">
                    <h2>Settings</h2>
                    <div className="button clickable flex hac vac" onClick={onClose} aria-label="Close settings">
                        <div className="icon">✗</div>
                        <div className="label">Close</div>
                    </div>
                </div>

                <ServiceError {...serviceError} />

                {isLoading ? (
                    <div className="settings-loading">Loading settings...</div>
                ) : (
                    <div className="settings-content vflex">
                        {/* Theme Section */}
                        <div className="settings-section vflex">
                            <h3>Theme</h3>
                            <div className="settings-row flex sb vac">
                                <label>Color Palette</label>
                                <select
                                    value={settings.theme}
                                    onChange={(e) => handleSettingChange("theme", e.target.value)}
                                    className="settings-select"
                                >
                                    {THEMES.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="settings-row flex sb vac">
                                <label>Scheme</label>
                                <select
                                    value={settings.scheme}
                                    onChange={(e) => handleSettingChange("scheme", e.target.value)}
                                    className="settings-select"
                                >
                                    {SCHEMES.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="settings-row flex sb vac">
                                <label>Color Filter</label>
                                <select
                                    value={settings.filter}
                                    onChange={(e) => handleSettingChange("filter", e.target.value)}
                                    className="settings-select"
                                >
                                    {FILTERS.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Font Section */}
                        <div className="settings-section vflex">
                            <h3>Font</h3>
                            <div className="settings-row flex sb vac">
                                <label>Size</label>
                                <select
                                    value={settings.fontSize}
                                    onChange={(e) => handleSettingChange("fontSize", e.target.value)}
                                    className="settings-select"
                                >
                                    {FONT_SIZES.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="settings-row flex sb vac">
                                <label>Contrast</label>
                                <select
                                    value={settings.fontContrast}
                                    onChange={(e) => handleSettingChange("fontContrast", e.target.value)}
                                    className="settings-select"
                                >
                                    {FONT_CONTRASTS.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Notifications Section */}
                        <div className="settings-section vflex">
                            <h3>Notifications</h3>
                            <div className="settings-row flex sb vac">
                                <label>Enable Notifications</label>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications}
                                    onChange={(e) => handleSettingChange("notifications", e.target.checked)}
                                    className="settings-checkbox"
                                />
                            </div>
                        </div>

                        {/* Online Presence Section */}
                        <div className="settings-section vflex">
                            <h3>Online Presence</h3>
                            <div className="settings-row flex sb vac">
                                <label>Show Online Status</label>
                                <input
                                    type="checkbox"
                                    checked={settings.onlinePresence}
                                    onChange={(e) => handleSettingChange("onlinePresence", e.target.checked)}
                                    className="settings-checkbox"
                                />
                            </div>
                        </div>

                        {/* Sounds Section */}
                        <div className="settings-section vflex">
                            <h3>Sounds</h3>
                            <div className="settings-row flex sb vac">
                                <label>Enable Sounds</label>
                                <input
                                    type="checkbox"
                                    checked={settings.sounds}
                                    onChange={(e) => handleSettingChange("sounds", e.target.checked)}
                                    className="settings-checkbox"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export { UserSettings };
