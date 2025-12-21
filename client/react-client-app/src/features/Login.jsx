import { useState, useEffect } from "react";
import { ServiceError } from "../components/Error";
import { location } from "../session";
import { Link } from "../components/Link";

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
    const [btn_options, set_btn_options] = useState({ "aria-disabled": true, disabled: "disabled" });

    const [fromSignup, _] = useState(location.retrieve("path")?.endsWith("#signup:true") || false);
    const [failedLogin, setFailedLogin] = useState(false);

    function updateLoginPassword(password) {
        set_login_password(password);
    }

    function updateLoginUsername(username) {
        set_login_username(username);
    }

    async function onLoginLocal() {
        if (!login_password || !login_username) {
            return;
        }

        try {
            // Delegate authentication to parent - it handles authTokenAction and state
            if (onLogin) {
                await onLogin({ username: login_username, password: login_password });
            }
            setFailedLogin(false);
        } catch {
            setFailedLogin(true);
        }
        set_login_password("");
        set_login_username("");
    }

    useEffect(() => {
        if (areUserCredentialsValid(login_username, login_password)) {
            set_btn_options({ "aria-disabled": false });
        } else {
            set_btn_options({ "aria-disabled": true, disabled: "disabled" });
        }
    }, [login_password, login_username]);

    return (
        <div className="container p-3 flex hac vac">
            <div className="form-container max-w-sm vflex">
                <h2>Login</h2>

                {failedLogin && <ServiceError hasError={true} message="login failed"></ServiceError>}
                {fromSignup && <p className="message message--success">Signup was successful!</p>}

                <div className="form-group">
                    <label htmlFor="login_username" className="form-label">
                        Username
                    </label>
                    <input
                        type="text"
                        id="login_username"
                        name="login_username"
                        placeholder="Username"
                        value={login_username}
                        onChange={e => updateLoginUsername(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="login_password" className="form-label">
                        Password
                    </label>
                    <input
                        type="password"
                        id="login_password"
                        name="login_password"
                        placeholder="Password"
                        value={login_password}
                        onChange={e => updateLoginPassword(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="form-actions">
                    <button {...btn_options}
                        type="button"
                        className="btn btn-primary cta"
                        onClick={onLoginLocal}>Login</button>
                </div>

                <div>
                    <Link to="/signup">create a new account</Link>
                </div>
            </div>
        </div>);
}

export { Login };
