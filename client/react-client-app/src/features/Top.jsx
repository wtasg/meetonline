import { Welcome } from "../components/Welcome";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { loginAction, signupAction, logoutAction } from "../actions/authActions";
import { Logout } from "./Logout";
import { user_session } from "../session";
import { hasUserSession } from "../utils/session";
import { useState } from "react";
import { UserAccount } from "./UserAccount";

function Top() {
    const [hasSession, setHasSession] = useState(hasUserSession());
    const { pathname } = window.location;

    async function onLogout() {
        try {
            await logoutAction();
            setHasSession(false);
        } catch (err) {
            console.error(err);
        } finally {
            window.location.reload(false);
        }
    }
    async function onLogin({ username, password }) {
        const isLoggedIn = await loginAction({ username, password });
        if (isLoggedIn) {
            setHasSession(true);
            window.location = "/";
        } else {
            setHasSession(false);
        }
    }

    async function onSignup({ username, password }) {
        await signupAction({ username, password });
        setHasSession(false);
    }

    switch (pathname) {
        case "/login":
            return !hasSession && <Login onLogin={onLogin} />;
        case "/signup":
            return !hasSession && <Signup onSignup={onSignup} />;
        case "/account":
            return hasSession && <UserAccount />;
        case "/logout":
            return hasSession ? <Logout onLogout={onLogout} username={() => user_session.retrieve("username")} /> : <div>You are logged out.</div>;
        case "/":
            return hasSession &&
                <>
                    <Welcome />
                    <Logout onLogout={onLogout} username={() => user_session.retrieve("username")} />
                </>;
        default:
            return <>
                {!hasSession && <div>You are logged out.</div>}
                {
                    hasSession && <><Welcome /></>
                }
            </>;
    }
}

export { Top };
