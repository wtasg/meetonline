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
        <div className="flex hac vac w80">
            <div className="form signup vflex w40p">
                <h2>Signup</h2>
                {presignupError && <ServiceError hasError={true} message={presignupError}></ServiceError>}
                <div>
                    <label htmlFor="signup_username" className="vflex">
                        <>Username</>
                        <input
                            type="text"
                            id="signup_username"
                            name="signup_username"
                            placeholder="signup_username"
                            value={signup_username}
                            onChange={e => updateSignupUsername(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label htmlFor="signup_password" className="vflex">
                        <>Password</>
                        <input
                            type="password"
                            id="signup_password"
                            name="signup_password"
                            placeholder="signup_password"
                            value={signup_password}
                            onChange={e => updateSignupPassword(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <button type="button" className="cta" onClick={onSignupLocal}>Signup</button>
                </div>
                <div>
                    <Link to="/login">login instead</Link>
                </div>
            </div>
        </div >
    );
}

export { Signup };
