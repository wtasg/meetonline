import { useState, useEffect } from "react";
import { hasUserSession } from "../utils/session";
import { preSignupAction } from "../actions/authActions";
import { Link } from "../components/Link";
import { ServiceError } from "../components/Error";

function Signup({ onSignup }) {
    const [signup_password, set_signup_password] = useState("");
    const [signup_username, set_signup_username] = useState("");
    const [presignupError, setPresignupError] = useState("");

    function updateSignupPassword(password) {
        set_signup_password(password);
    }

    function updateSignupUsername(username) {
        set_signup_username(username);
    }

    async function onSignupLocal() {
        if (!signup_password || !signup_username) {
            return;
        }
        await onSignup({ username: signup_username, password: signup_password });
        set_signup_password("");
        set_signup_username("");
    }

    useEffect(() => {
        (async function () {
            if (!hasUserSession()) {
                const result = await preSignupAction();
                if (!result.ok) {
                    setPresignupError(result.message);
                } else {
                    setPresignupError("");
                }
            }
        })();
    }, []);

    return (
        <div className="container p-3 flex hac vac">
            <div className="form-container max-w-sm vflex">
                <h2>Signup</h2>
                {presignupError && <ServiceError hasError={true} message={presignupError}></ServiceError>}

                <div className="form-group">
                    <label htmlFor="signup_username" className="form-label">
                        Username
                    </label>
                    <input
                        type="text"
                        id="signup_username"
                        name="signup_username"
                        placeholder="Username"
                        value={signup_username}
                        onChange={e => updateSignupUsername(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="signup_password" className="form-label">
                        Password
                    </label>
                    <input
                        type="password"
                        id="signup_password"
                        name="signup_password"
                        placeholder="Password"
                        value={signup_password}
                        onChange={e => updateSignupPassword(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-primary cta" onClick={onSignupLocal}>Signup</button>
                </div>

                <div>
                    <Link to="/login">login instead</Link>
                </div>
            </div>
        </div>
    );
}

export { Signup };
