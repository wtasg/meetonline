import { hasUserSession } from "../utils/session.js";
import { Link } from "../components/Link.jsx";

function Menu() {
    const hasSession = hasUserSession();

    return <nav className="flex">
        <ul className="flex">
            <li>
                <Link to={"/"}>Home</Link>
            </li>
            {
                hasSession && <>
                    <li>
                        <Link to={"/account"}>account</Link>
                    </li>
                    <li>
                        <Link to={"/profile"}>profile</Link>
                    </li>
                    <li>
                        <Link to={"/groups"}>groups</Link>
                    </li>
                </>
            }
        </ul>
        <ul className="flex">
            {!hasSession && <>
                <li>
                    <Link to={"/login"}>login</Link>
                </li>
                <li>
                    <Link to={"/signup"}>signup</Link>
                </li>
            </>
            }
            {
                hasSession &&
                <li>
                    <Link to={"/logout"}>logout</Link>
                </li>
            }
        </ul>
    </nav>;
}

export { Menu };
