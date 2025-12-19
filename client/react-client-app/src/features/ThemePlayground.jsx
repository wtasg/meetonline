import { useState } from "react";
import { applyTheme, applyScheme, applyFilter } from "../utils/theme.js";

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

function ThemePlayground() {
    const [theme, setTheme] = useState("gray");
    const [scheme, setScheme] = useState("light");
    const [filter, setFilter] = useState("default");

    function handleThemeChange(newTheme) {
        setTheme(newTheme);
        applyTheme(newTheme);
    }

    function handleSchemeChange(newScheme) {
        setScheme(newScheme);
        applyScheme(newScheme);
    }

    function handleFilterChange(newFilter) {
        setFilter(newFilter);
        applyFilter(newFilter);
    }

    return (
        <div className="theme-playground" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <h1>Theme System Playground</h1>
            <p>Test different theme combinations and see how they affect the UI.</p>

            <div className="vflex" style={{ gap: "2rem", marginTop: "2rem" }}>
                {/* Theme Controls */}
                <div className="box">
                    <h2>Theme Controls</h2>
                    <div className="vflex" style={{ gap: "1rem" }}>
                        <div className="flex sb vac">
                            <label><strong>Color Palette:</strong></label>
                            <div className="flex" style={{ gap: "0.5rem" }}>
                                {THEMES.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => handleThemeChange(value)}
                                        style={{
                                            padding: "0.5rem 1rem",
                                            fontWeight: theme === value ? "bold" : "normal",
                                            border: theme === value ? "2px solid currentColor" : "1px solid currentColor"
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex sb vac">
                            <label><strong>Scheme:</strong></label>
                            <div className="flex" style={{ gap: "0.5rem" }}>
                                {SCHEMES.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => handleSchemeChange(value)}
                                        style={{
                                            padding: "0.5rem 1rem",
                                            fontWeight: scheme === value ? "bold" : "normal",
                                            border: scheme === value ? "2px solid currentColor" : "1px solid currentColor"
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex sb vac">
                            <label><strong>Color Filter:</strong></label>
                            <div className="flex" style={{ gap: "0.5rem" }}>
                                {FILTERS.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => handleFilterChange(value)}
                                        style={{
                                            padding: "0.5rem 1rem",
                                            fontWeight: filter === value ? "bold" : "normal",
                                            border: filter === value ? "2px solid currentColor" : "1px solid currentColor"
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* UI Samples */}
                <div className="box">
                    <h2>Sample UI Elements</h2>
                    <div className="vflex" style={{ gap: "1.5rem" }}>
                        {/* Text Samples */}
                        <div>
                            <h3>Typography</h3>
                            <h1>Heading 1</h1>
                            <h2>Heading 2</h2>
                            <h3>Heading 3</h3>
                            <h4>Heading 4</h4>
                            <p>This is a paragraph with normal text.</p>
                            <p style={{ color: "var(--text-secondary)" }}>This is secondary text.</p>
                            <p style={{ color: "var(--text-tertiary)" }}>This is tertiary text.</p>
                            <a href="#" style={{ color: "var(--text-link)" }}>This is a link</a>
                        </div>

                        {/* Buttons */}
                        <div>
                            <h3>Buttons</h3>
                            <div className="flex" style={{ gap: "1rem" }}>
                                <button style={{
                                    backgroundColor: "var(--button-primary-background)",
                                    color: "var(--button-primary-text)",
                                    border: "1px solid var(--button-primary-border)"
                                }}>Primary Button</button>
                                <button style={{
                                    backgroundColor: "var(--button-secondary-background)",
                                    color: "var(--button-secondary-text)",
                                    border: "1px solid var(--button-secondary-border)"
                                }}>Secondary Button</button>
                                <button disabled>Disabled Button</button>
                            </div>
                        </div>

                        {/* Inputs */}
                        <div>
                            <h3>Form Elements</h3>
                            <div className="vflex" style={{ gap: "0.5rem" }}>
                                <input
                                    type="text"
                                    placeholder="Text input"
                                    style={{
                                        backgroundColor: "var(--input-background)",
                                        color: "var(--input-text)",
                                        border: "1px solid var(--input-border)"
                                    }}
                                />
                                <select style={{
                                    backgroundColor: "var(--input-background)",
                                    color: "var(--input-text)",
                                    border: "1px solid var(--input-border)",
                                    padding: "0.5rem"
                                }}>
                                    <option>Option 1</option>
                                    <option>Option 2</option>
                                    <option>Option 3</option>
                                </select>
                                <label>
                                    <input type="checkbox" /> Checkbox
                                </label>
                            </div>
                        </div>

                        {/* State Messages */}
                        <div>
                            <h3>State Messages</h3>
                            <div className="vflex" style={{ gap: "0.5rem" }}>
                                <div style={{
                                    padding: "1rem",
                                    backgroundColor: "var(--state-success-background)",
                                    border: "1px solid var(--state-success-border)",
                                    color: "var(--state-success-text)"
                                }}>
                                    Success: Operation completed successfully!
                                </div>
                                <div style={{
                                    padding: "1rem",
                                    backgroundColor: "var(--state-warning-background)",
                                    border: "1px solid var(--state-warning-border)",
                                    color: "var(--state-warning-text)"
                                }}>
                                    Warning: Please review this information.
                                </div>
                                <div style={{
                                    padding: "1rem",
                                    backgroundColor: "var(--state-danger-background)",
                                    border: "1px solid var(--state-danger-border)",
                                    color: "var(--state-danger-text)"
                                }}>
                                    Error: Something went wrong!
                                </div>
                                <div style={{
                                    padding: "1rem",
                                    backgroundColor: "var(--state-info-background)",
                                    border: "1px solid var(--state-info-border)",
                                    color: "var(--state-info-text)"
                                }}>
                                    Info: Here's some helpful information.
                                </div>
                            </div>
                        </div>

                        {/* Cards */}
                        <div>
                            <h3>Cards</h3>
                            <div className="flex" style={{ gap: "1rem" }}>
                                <div style={{
                                    padding: "1rem",
                                    backgroundColor: "var(--card-background)",
                                    border: "1px solid var(--card-border)",
                                    borderRadius: "0.5rem",
                                    flex: 1
                                }}>
                                    <h4>Card Title</h4>
                                    <p>This is a card with some content inside it.</p>
                                </div>
                                <div style={{
                                    padding: "1rem",
                                    backgroundColor: "var(--surface-raised)",
                                    border: "1px solid var(--border-primary)",
                                    borderRadius: "0.5rem",
                                    flex: 1
                                }}>
                                    <h4>Raised Surface</h4>
                                    <p>This surface appears elevated.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Settings Display */}
                <div className="box">
                    <h2>Current Settings</h2>
                    <div className="vflex" style={{ gap: "0.5rem" }}>
                        <p><strong>Theme:</strong> {theme}</p>
                        <p><strong>Scheme:</strong> {scheme}</p>
                        <p><strong>Filter:</strong> {filter}</p>
                        <p><strong>HTML Root Attributes:</strong></p>
                        <pre style={{
                            padding: "1rem",
                            backgroundColor: "var(--background-secondary)",
                            border: "1px solid var(--border-primary)",
                            borderRadius: "0.25rem",
                            overflow: "auto"
                        }}>
                            {`data-theme="${document.documentElement.getAttribute('data-theme') || 'none'}"\n`}
                            {`data-filter="${document.documentElement.getAttribute('data-filter') || 'none'}"\n`}
                            {`class="${document.documentElement.className || 'none'}"`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ThemePlayground;
