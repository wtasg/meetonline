import { Welcome } from "../components/Welcome";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { loginAction, signupAction, logoutAction, preLoginAction, preSignupAction } from "../actions/authActions";
import { Logout } from "./Logout";
import { user_session } from "../session";
import { hasUserSession } from "../utils/session";
import { useEffect, useState } from "react";

/**
 * Render top-level authentication UI and manage session-related state.
 *
 * Renders Welcome always; when a user session exists shows Logout (with username),
 * otherwise shows Login and Signup. On mount, if no session exists it runs
 * preLoginAction and preSignupAction. Handlers call login, signup, and logout actions
 * and update which controls are shown.
 *
 * @returns {JSX.Element} The top-level React element for the welcome and authentication UI.
 */
function Top() {
    const [showLogoutButton, setShowLogoutButton] = useState(hasUserSession());

    useEffect(() => {
        (async function () {
            if (!hasUserSession()) {
                await preLoginAction();
                await preSignupAction();
            }
        })();
    }, []);

    async function onLogout() {
        await logoutAction();
        setShowLogoutButton(false);
    }

    async function onLogin({ username, password }) {
        const isLoggedIn = await loginAction({ username, password });
        if (isLoggedIn) {
            setShowLogoutButton(true);
        } else {
            setShowLogoutButton(false);
        }
    }

    async function onSignup({ username, password }) {
        await signupAction({ username, password });
        setShowLogoutButton(false);
    }

    return <>
        <Welcome />
        {
            !showLogoutButton &&
            <Login onlogin={onLogin} />
        }
        {
            !showLogoutButton &&
            <Signup onsignup={onSignup} />
        }
        {
            showLogoutButton &&
            <Logout onlogout={onLogout} username={() => user_session["username"]} />
        }
    </>;
}

export { Top };