import { hasUserSession } from "../utils/session";

function Menu() {
    const hasSession = hasUserSession();
    return <div role="navigation" className="vflex menu sidebar">
        <ul>
            <li><a href="/">home</a></li>
            {hasSession && <li><a href="/account">account</a></li>}
            {hasSession && <li><a href="/profile">profile</a></li>}
        </ul>
        <ul>
            {!hasSession && <li><a href="/login">login</a></li>}
            {!hasSession && <li><a href="/signup">signup</a></li>}
            {hasSession && <li><a href="/logout">logout</a></li>}
        </ul>
    </div>;
}

export { Menu };
