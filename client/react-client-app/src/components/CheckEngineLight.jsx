import { useEffect } from "react";
import { checkEngineLight } from "../net/check-engine-light";


function CheckEngineLight() {
    useEffect(() => {
        async function cel() {
            await checkEngineLight();
        }
        cel();
    }, []);

    return null;
}


export { CheckEngineLight }
