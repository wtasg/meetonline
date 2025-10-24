import { CONF } from './net-conf';


async function checkEngineLight() {
    fetch(`${CONF.SERVER}/cel`).then(res => res).then(data => console.log(data)).catch(e => {
        if (e instanceof TypeError) {
            console.log("TypeError!");
        }
        console.error(e);
    });
}

export { checkEngineLight };
