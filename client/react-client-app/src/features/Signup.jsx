import { useState } from "react";

function Signup({ onsignup }) {
    const [signup_password, set_signup_password] = useState();
    const [signup_username, set_signup_username] = useState();

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

    return (<>
        <p>Signup</p>
        <input type="text" id="signup_username" placeholder="signup_username" onChange={e => updateSignupUsername(e.target.value)} />
        <input type="text" id="signup_password" placeholder="signup_password" onChange={e => updateSignupPassword(e.target.value)} />
        <button type="button" onClick={onSignup}>Signup</button>
    </>);
}

export { Signup };
