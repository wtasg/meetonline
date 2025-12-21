import { Welcome } from "../components/Welcome";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { authTokenAction, signupAction } from "../actions/authActions";
import { UserAccount } from "./UserAccount";
import { UserProfile } from "./UserProfile";
import Group from "./Group";
import Event from "./Event";
import Search from "./Search";
import ThemePlayground from "./ThemePlayground";
import { OAuthCallback } from "./OAuthCallback";
import { useRoute } from "../hooks/useRoute";
import { useNavigate } from "../hooks/useNavigate";
import { useSession } from "../hooks/useSession";

function Content() {
    const { hasSession, login } = useSession();
    const navigate = useNavigate();

    async function onLogin({ username, password }) {
        const result = await authTokenAction({ username, password });
        if (result) {
            login(); // Update global session state
            navigate("/");
        } else {
            throw new Error("Login failed. Please check your credentials.");
        }
    }

    async function onSignup({ username, password }) {
        const { ok, signup } = await signupAction({ username, password });
        if (ok && signup) {
            navigate("/login#signup:true");
        }
    }

    const pathname = useRoute();
    if (pathname.startsWith("/login")) {
        return !hasSession && <Login onLogin={onLogin} />;
    } else if (pathname.startsWith("/signup")) {
        return !hasSession && <Signup onSignup={onSignup} />;
    } else if (pathname.startsWith("/oauth/callback")) {
        return <OAuthCallback />;
    } else if (pathname.startsWith("/account")) {
        return hasSession && <UserAccount />;
    } else if (pathname.startsWith("/profile")) {
        return hasSession && <UserProfile />;
    } else if (pathname.startsWith("/groups")) {
        return hasSession && <Group />;
    } else if (pathname.startsWith("/events")) {
        return hasSession && <Event />;
    } else if (pathname.startsWith("/search")) {
        return hasSession && <Search />;
    } else if (pathname.startsWith("/theme-playground")) {
        return <ThemePlayground />;
    } else if (pathname.startsWith("/")) {
        return <Welcome />;
    } else {
        return <>
            ERROR
        </>;
    }

}

export { Content };
