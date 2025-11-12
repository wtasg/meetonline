import { useState, useEffect } from "react";
import { hasUserSession } from "../utils/session";
import { preSignupAction } from "../actions/authActions";

function Signup({ onsignup }) {
    const [signup_password, set_signup_password] = useState("");
    const [signup_username, set_signup_username] = useState("");

    function updateSignupPassword(password) {
        if (!password) {
            return;
        }
        set_signup_password(password);
    }

    function updateSignupUsername(username) {
        if (!username) {
            return;
        }
        set_signup_username(username);
    }

    async function onSignup() {
        await onsignup({ username: signup_username, password: signup_password });
        set_signup_password("");
        set_signup_username("");
    }

    useEffect(() => {
        (async function () {
            if (!hasUserSession()) {
                await preSignupAction();
            }
        })();
    }, []);

    return (<div className="form signup vflex">
        <h2>Signup</h2>
        <div>
            <label htmlFor="signup_username" className="flex">
                <>Username:</>
                <input type="text" id="signup_username" placeholder="signup_username" value={signup_username} onChange={e => updateSignupUsername(e.target.value)} />
            </label>
        </div>
        <div>
            <label htmlFor="signup_password" className="flex">
                <>Password:</>
                <input type="password" id="signup_password" placeholder="signup_password" value={signup_password} onChange={e => updateSignupPassword(e.target.value)} />
            </label>
        </div>
        <div>
            <button type="button" onClick={onSignup}>Signup</button>
        </div>
    </div>);
}

export { Signup };
