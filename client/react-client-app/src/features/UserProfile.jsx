import { useState, useEffect } from "react";
import { fetchUserProfile, updateAddress, updateDisplayName, updateEmail, updatePhoneNumber, updateProfileName, updateWebsiteUrl } from "../actions/userProfileActions.js";
import { EditableValue } from "../components/EditableValue.jsx";
import { ServiceError } from "../components/Error.jsx";

function UserProfile() {
    const [serviceError, setServiceError] = useState({ hasError: false, message: "" });
    const [profile, setProfile] = useState({ profileName: "", displayName: "", phoneNumber: "", email: "", address: "", websiteUrl: "", createdAt: "", modifiedAt: "" });
    useEffect(() => {
        (async function () {
            const profile = await fetchUserProfile();
            if (!profile.ok) {
                setServiceError({ hasError: true, message: profile.message });
                return;
            }
            const { id, profileName, displayName, phoneNumber, email, address, websiteUrl, createdAt, modifiedAt } = profile.user_profile;
            setProfile({ id, profileName, displayName, phoneNumber, email, address, websiteUrl, createdAt, modifiedAt });
        })();
    }, []);

    function updateProfileDetail(key, value) {
        if (key === "profileName") {
            updateProfileName(value);
        } else if (key === "displayName") {
            updateDisplayName(value);
        } else if (key === "email") {
            updateEmail(value);
        } else if (key === "phoneNumber") {
            updatePhoneNumber(value);
        } else if (key === "address") {
            updateAddress(value);
        } else if (key === "websiteUrl") {
            updateWebsiteUrl(value);
        }
        profile[key] = value;
        setProfile({ ...profile });
    }

    return (
        <div className="flex hac vac w80p">
            <div className="vflex">
                <h2>User Profile</h2>
                <ServiceError {...serviceError} />
                <div className="flex">
                    <div className="w30p">Profile Name</div>
                    <div>
                        <EditableValue
                            klass="w60p"
                            initialValue={profile.profileName}
                            onChangeFn={(value) => updateProfileDetail("profileName", value)} />
                    </div>
                </div>
                <div className="flex">
                    <div className="w30p">Display Name </div>
                    <div>
                        <EditableValue
                            klass="w60p"
                            initialValue={profile.displayName}
                            onChangeFn={(value) => updateProfileDetail("displayName", value)} />
                    </div>
                </div>
                <div className="flex">
                    <div className="w30p">Phone Number </div>
                    <div>
                        <EditableValue
                            klass="w60p"
                            initialValue={profile.phoneNumber}
                            onChangeFn={(value) => updateProfileDetail("phoneNumber", value)} />
                    </div>
                </div>
                <div className="flex">
                    <div className="w30p">Email </div>
                    <div>
                        <EditableValue
                            klass="w60p"
                            valueType={"email"}
                            initialValue={profile.email}
                            onChangeFn={(value) => updateProfileDetail("email", value)} />
                    </div>

                </div>
                <div className="flex">
                    <div className="w30p">Address </div>
                    <div>
                        <EditableValue
                            klass="w60p"
                            initialValue={profile.address}
                            onChangeFn={(value) => updateProfileDetail("address", value)} />
                    </div>

                </div>
                <div className="flex">
                    <div className="w30p">Website URL </div>
                    <div>
                        <EditableValue
                            klass="w60p"
                            initialValue={profile.websiteUrl}
                            onChangeFn={(value) => updateProfileDetail("websiteUrl", value)} />
                    </div>

                </div>
                <div className="flex">
                    <div className="w30p">Created At </div>
                    <div>{profile.createdAt}</div>

                </div>
                <div className="flex">
                    <div className="w30p">Modified At </div>
                    <div>{profile.modifiedAt}</div>
                </div>
            </div>
        </div>
    );
}

export { UserProfile };
