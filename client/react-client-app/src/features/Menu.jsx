import { hasUserSession } from "../utils/session";

function Menu() {
    const hasSession = hasUserSession();
    return <div role="navigation" className="vflex sb menu sidebar">
        <ul style={{ minHeight: "300px" }}>
            <li><a href="/">home</a></li>
            {hasSession && <li><a href="/account">account</a></li>}

        </ul>
        <ul style={{ minHeight: "300px" }}>
            {!hasSession && <li><a href="/login">login</a></li>}
            {!hasSession && <li><a href="/signup">signup</a></li>}
            {hasSession && <li><a href="/logout">logout</a></li>}
        </ul>
    </div>;
}

export { Menu };
