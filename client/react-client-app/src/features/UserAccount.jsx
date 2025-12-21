import { useState, useEffect } from "react";
import { fetchUserAccount } from "../actions/userAccountActions.js";
import { ConnectedAccounts } from "./ConnectedAccounts";

function UserAccount() {

    const [account, setAccount] = useState({ username: "", createdAt: "", modifiedAt: "" });
    useEffect(() => {
        (async function () {
            setAccount(await fetchUserAccount());
        })();
    }, []);

    return (
        <div className="container p-3">
            <div className="vflex max-w-lg">
                <h2>User Account</h2>

                <div className="form-group">
                    <label className="form-label">Username</label>
                    <div>{account.username}</div>
                </div>

                <div className="form-group">
                    <label className="form-label">Created At</label>
                    <div className="flex gap-2 wrap">
                        <span>{new Date(account.createdAt).toLocaleDateString()}</span>
                        <span className="text-muted">({new Date(account.createdAt).toDateString()})</span>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Last Modified At</label>
                    <div className="flex gap-2 wrap">
                        <span>{new Date(account.modifiedAt).toLocaleDateString()}</span>
                        <span className="text-muted">({new Date(account.modifiedAt).toDateString()})</span>
                    </div>
                </div>

                <ConnectedAccounts />
            </div>
        </div>
    );
}

export { UserAccount };
