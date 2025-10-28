import { Welcome } from "../components/Welcome";
import { CheckEngineLight } from "../components/CheckEngineLight";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { loginAction, signupAction } from "../actions/authActions";

function Top() {
    return <>
        <Welcome />
        <CheckEngineLight />
        <Login onlogin={loginAction} />
        <Signup onsignup={signupAction} />
    </>;
}

export { Top };
