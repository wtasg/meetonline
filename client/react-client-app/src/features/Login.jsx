import { useState } from "react";

function Login({ onlogin }) {
    const [login_password, set_login_password] = useState();
    const [login_username, set_login_username] = useState();

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

    async function onLogin() {
        await onlogin({ username: login_username, password: login_password });
        set_login_password("");
        set_login_username("");
    }

    return (<>
        <p>Login</p>
        <input type="text" id="login_username" placeholder="login_username" onChange={e => updateLoginUsername(e.target.value)} />
        <input type="text" id="login_password" placeholder="login_password" onChange={e => updateLoginPassword(e.target.value)} />
        <button type="button" onClick={onLogin}>Login</button>
    </>);
}

export { Login }
