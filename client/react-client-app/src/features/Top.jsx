import { Welcome } from "../components/Welcome";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { loginAction, signupAction, logoutAction, preLoginAction, preSignupAction } from "../actions/authActions";
import { Logout } from "./Logout";
import { user_session } from "../session";
import { hasUserSession } from "../utils/session";
import { useEffect, useState } from "react";
import { UserAccount } from "./UserAccount";

function Top() {
    const [hasSession, setHasSession] = useState(hasUserSession());

    useEffect(() => {
        (async function () {
            if (!hasUserSession()) {
                await preLoginAction();
                await preSignupAction();
            }
        })();
    }, []);

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
        } else {
            setHasSession(false);
        }
    }

    async function onSignup({ username, password }) {
        await signupAction({ username, password });
        setHasSession(false);
    }

    return <>
        <Welcome />
        {
            !hasSession &&
            <Login onlogin={onLogin} />
        }
        {
            !hasSession &&
            <Signup onsignup={onSignup} />
        }
        {
            hasSession &&
            <Logout onlogout={onLogout} username={() => user_session.retrieve("username")} />
        }
        {
            hasSession && <UserAccount />
        }
    </>;
}

export { Top };
