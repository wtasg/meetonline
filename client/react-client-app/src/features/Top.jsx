import { Welcome } from "../components/Welcome";
import { CheckEngineLight } from "../components/CheckEngineLight";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { loginAction, signupAction, logoutAction } from "../actions/authActions";
import { Logout } from "./Logout";
import { user_session } from "../session";
import { hasUserSession } from "../utils/session";
import { useState } from "react";

function Top() {
    const [showLogoutButton, setShowLogoutButton] = useState(hasUserSession());
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
        <CheckEngineLight />
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
