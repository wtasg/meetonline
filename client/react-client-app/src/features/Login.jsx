import { useState, useEffect } from "react";
import { hasUserSession } from "../utils/session";
import { preLoginAction } from "../actions/authActions";

function Login({ onLogin }) {
    const [login_password, set_login_password] = useState("");
    const [login_username, set_login_username] = useState("");

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

    return (<div className="form login vflex">
        <h2>Login</h2>
        <div>
            <label htmlFor="login_username" className="flex">
                <>Username:</>
                <input type="text" id="login_username" name="login_username" placeholder="login_username" value={login_username} onChange={e => updateLoginUsername(e.target.value)} />
            </label>
        </div>
        <div>
            <label htmlFor="login_password" className="flex">
                <>Password:</>
                <input type="password" id="login_password" name="login_password" placeholder="login_password" value={login_password} onChange={e => updateLoginPassword(e.target.value)} />
            </label>
        </div>
        <div>
            <button type="button" onClick={onLoginLocal}>Login</button>
        </div>
    </div>);
}

export { Login };
