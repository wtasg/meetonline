import { hasUserSession } from "../utils/session.js";
import { Link } from "../components/Link.jsx";

function Menu() {
    const hasSession = hasUserSession();

    return <div role="navigation" className="vflex menu sidebar">
        <ul>
            <li>
                <Link to={"/"}>Home</Link>
            </li>
            {
                hasSession &&
                <li>
                    <Link to={"/account"}>account</Link>
                </li>
            }
            {
                hasSession &&
                <li>
                    <Link to={"/profile"}>profile</Link>
                </li>
            }
        </ul>
        <ul>
            {!hasSession &&
                <li>
                    <Link to={"/login"}>login</Link>
                </li>
            }
            {!hasSession &&
                <li>
                    <Link to={"/signup"}>signup</Link>
                </li>
            }
            {
                hasSession &&
                <li>
                    <Link to={"/logout"}>logout</Link>
                </li>
            }
        </ul>
    </div>;
}

export { Menu };
