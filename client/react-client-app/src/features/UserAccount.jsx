import { useState, useEffect } from "react";
import { fetchUserAccount } from "../actions/userAccountActions.js";
import { hasUserSession } from "../utils/session.js";

function UserAccount() {

    const [account, setAccount] = useState({ username: "", createdAt: "", modifiedAt: "" });
    useEffect(() => {
        (async function () {
            setAccount(await fetchUserAccount());
        })();
    }, []);

    if (!hasUserSession()) {
        window.location.assign("/login");
        return;
    }
    return (<>
        <p>Username: {account.username}</p>
        <p>Created At: {account.createdAt}</p>
        <p>Last Modified At: {account.modifiedAt}</p>
    </>);
}

export { UserAccount };
