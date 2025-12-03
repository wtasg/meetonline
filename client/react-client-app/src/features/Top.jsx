import { Welcome } from "../components/Welcome";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { loginAction, signupAction, logoutAction } from "../actions/authActions";
import { Logout } from "./Logout";
import { user_session } from "../session";
import { hasUserSession } from "../utils/session";
import { useState } from "react";
import { UserAccount } from "./UserAccount";
import { UserProfile } from "./UserProfile";
import { useRoute } from "../hooks/useRoute";
import { useNavigate } from "../hooks/useNavigate";

function Top() {
    const [hasSession, setHasSession] = useState(hasUserSession());
    const navigate = useNavigate();

    async function onLogout() {
        try {
            await logoutAction();
            setHasSession(false);
            navigate("/");
            // this is a hack. Need help here...
            window.location.assign("/");
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async function onLogin({ username, password }) {
        const isLoggedIn = await loginAction({ username, password });
        if (isLoggedIn) {
            setHasSession(true);
            navigate("/");
            // this is a hack. Need help here...
            window.location.assign("/");
        } else {
            setHasSession(false);
        }
    }

    async function onSignup({ username, password }) {
        setHasSession(false);
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

export { Top };
