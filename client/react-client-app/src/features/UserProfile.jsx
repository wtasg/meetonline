import { useState, useEffect } from "react";
import { fetchUserProfile } from "../actions/userProfileActions.js";
import { hasUserSession } from "../utils/session.js";
import { EditableValue } from "../components/EditableValue.jsx";

function UserProfile() {
    if (!hasUserSession()) {
        window.location.assign("/login");
        return;
    }

    const [profile, setProfile] = useState({ profileName: "", displayName: "", phoneNumber: "", email: "", address: "", websiteUrl: "", createdAt: "", modifiedAt: "" });
    useEffect(() => {
        (async function () {
            setProfile(await fetchUserProfile());
        })();
    }, []);

    return (<div className="vflex">
        <h2>User Profile</h2>
        <div className="flex">
            <div className="w30p">Profile Name </div>
            <div><EditableValue initialValue={profile.profileName} onChange={console.log} /></div>
        </div>
        <div className="flex">
            <div className="w30p">Display Name </div>
            <div><EditableValue initialValue={profile.displayName} onChange={console.log} /></div>
        </div>
        <div className="flex">
            <div className="w30p">Phone Number </div>
            <div><EditableValue initialValue={profile.phoneNumber} onChange={console.log} /></div>
        </div>
        <div className="flex">
            <div className="w30p">Email </div>
            <div><EditableValue initialValue={profile.email} onChange={console.log} /></div>

        </div>
        <div className="flex">
            <div className="w30p">Address </div>
            <div><EditableValue initialValue={profile.address} onChange={console.log} /></div>

        </div>
        <div className="flex">
            <div className="w30p">Website URL </div>
            <div><EditableValue initialValue={profile.websiteUrl} onChange={console.log} /></div>

        </div>
        <div className="flex">
            <div className="w30p">Created At </div>
            <div>{profile.createdAt}</div>

        </div>
        <div className="flex">
            <div className="w30p">Modified At </div>
            <div>{profile.modifiedAt}</div>
        </div>
    </div>);
}

export { UserProfile };
