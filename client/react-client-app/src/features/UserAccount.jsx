import { useState, useEffect } from "react";
import { fetchUserAccount } from "../actions/userAccountActions.js";
import { hasUserSession } from "../utils/session.js";
import { location } from "../session.js";

function UserAccount() {
    if (!hasUserSession()) {
        location.store("path", "/login");
        return;
    }

    const [account, setAccount] = useState({ username: "", createdAt: "", modifiedAt: "" });
    useEffect(() => {
        (async function () {
            setAccount(await fetchUserAccount());
        })();
    }, []);

    return (<div className="vflex">
        <h2>User Account</h2>
        <div className="flex"><div className="w30p">Username</div><div>{account.username}</div></div>
        <div className="flex"><div className="w30p">Created At</div><div>{new Date(account.createdAt).toLocaleDateString()}</div> <div>({new Date(account.createdAt).toDateString()})</div></div>
        <div className="flex"><div className="w30p">Last Modified At</div><div>{new Date(account.modifiedAt).toLocaleDateString()}</div> <div>({new Date(account.modifiedAt).toDateString()})</div></div>
    </div>);
}

export { UserAccount };
