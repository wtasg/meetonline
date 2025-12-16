import { Welcome } from "../components/Welcome";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { authTokenAction, signupAction, logoutAction } from "../actions/authActions";
import { Logout } from "./Logout";
import { user_session } from "../session";
import { UserAccount } from "./UserAccount";
import { UserProfile } from "./UserProfile";
import Group from "./Group";
import { useRoute } from "../hooks/useRoute";
import { useNavigate } from "../hooks/useNavigate";
import { useSession } from "../hooks/useSession";

function Content() {
    const { hasSession, login, logout } = useSession();
    const navigate = useNavigate();

    async function onLogout() {
        try {
            await logoutAction();
            logout(); // Update global session state
            navigate("/");
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

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
    } else if (pathname.startsWith("/account")) {
        return hasSession && <UserAccount />;
    } else if (pathname.startsWith("/profile")) {
        return hasSession && <UserProfile />;
    } else if (pathname.startsWith("/groups")) {
        return hasSession && <Group />;
    } else if (pathname.startsWith("/logout")) {
        return hasSession ? <Logout onLogout={onLogout} username={() => user_session.retrieve("username")} /> : <div>You are logged out.</div>;
    } else if (pathname.startsWith("/")) {
        return hasSession && <> <Welcome /> </>;
    } else {
        return <>
            ERROR
        </>;
    }

}

export { Content };
