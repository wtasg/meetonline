import { useState, useEffect } from "react";
import { hasUserSession } from "../utils/session";
import { preLoginAction } from "../actions/authActions";

/**
 * Returns true if user credentials are valid to POST
 * @param {{username: string, password: string}} options user credentials to be validated
 * @returns {boolean}
 */
function areUserCredentialsValid(username, password) {
    return typeof username === "string" &&
        typeof password === "string" &&
        username.trim().length > 0 &&
        password.trim().length > 0;
}

function Login({ onLogin }) {
    const [login_password, set_login_password] = useState("");
    const [login_username, set_login_username] = useState("");
    const [btn_options, set_btn_options] = useState({ ariaDisabled: true, disabled: "disabled" });

    function updateLoginPassword(password) {
        if (!password) {
            return;
        }
        set_login_password(password);
    }

    function updateLoginUsername(username) {
        if (!username) {
            return;
        }
        set_login_username(username);
    }

    async function onLoginLocal() {
        await onLogin({ username: login_username, password: login_password });
        set_login_password("");
        set_login_username("");
    }

    useEffect(() => {
        (async function () {
            if (!hasUserSession()) {
                await preLoginAction();
            }
        })();
    }, []);

    useEffect(() => {
        if (areUserCredentialsValid(login_username, login_password)) {
            set_btn_options({ ariaDisabled: false });
        } else {
            set_btn_options({ ariaDisabled: true, disabled: "disabled" });
        }
    }, [login_password, login_username]);

    return (<div className="form login vflex">
        <h2>Login</h2>
        <div>
            <label htmlFor="login_username" className="vflex">
                <>Username</>
                <input type="text" id="login_username" name="login_username" placeholder="login_username" value={login_username} onChange={e => updateLoginUsername(e.target.value)} />
            </label>
        </div>
        <div>
            <label htmlFor="login_password" className="vflex">
                <>Password</>
                <input type="password" id="login_password" name="login_password" placeholder="login_password" value={login_password} onChange={e => updateLoginPassword(e.target.value)} />
            </label>
        </div>
        <div>
            <button {...btn_options}
                type="button"
                className="cta"
                onClick={onLoginLocal}>Login</button>
        </div>
        <div>
            <a href="/signup">create a new account</a>
        </div>
    </div>);
}

export { Login };
