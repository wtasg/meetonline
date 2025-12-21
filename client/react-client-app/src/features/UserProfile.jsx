
import { useState, useEffect } from "react";
import { fetchUserProfile, updateAddress, updateDisplayName, updateEmail, updatePhoneNumber, updateProfileName, updateWebsiteUrl } from "../actions/userProfileActions.js";
import { EditableValue } from "../components/EditableValue.jsx";
import { ServiceError } from "../components/Error.jsx";
import { resetLocation, resetUserSession } from "../session.js";

function UserProfile() {
    const [serviceError, setServiceError] = useState({ hasError: false, message: "" });
    const [profile, setProfile] = useState({ profileName: "", displayName: "", phoneNumber: "", email: "", address: "", websiteUrl: "", createdAt: "", modifiedAt: "" });
    useEffect(() => {
        let isMounted = true;

        (async function () {
            try {
                const profile = await fetchUserProfile();
                if (!isMounted) return;

                const sessionErrorMessages = [
                    "Missing Cookie Headers.",
                    "Missing Session.",
                    "Invalid Session.",
                ];

                if (!profile.ok) {
                    if (sessionErrorMessages.includes(profile.message)) {
                        resetUserSession();
                        resetLocation();
                        return;
                    }

                    setServiceError({ hasError: true, message: profile.message });
                    return;
                }

                const { id, profileName, displayName, phoneNumber, email, address, websiteUrl, createdAt, modifiedAt } = profile.user_profile;
                setProfile({ id, profileName, displayName, phoneNumber, email, address, websiteUrl, createdAt, modifiedAt });

            } catch (error) {
                console.log({ error });
                if (isMounted) {
                    setServiceError({ hasError: true, message: "Unexpected Error" });
                }
            }
        })();

        return () => { isMounted = false; };
    }, [resetUserSession, resetLocation]);

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
        <div className="container p-3">
            <div className="vflex max-w-lg">
                <h2>User Profile</h2>
                <p className="text-muted">Change and hit enter to save.</p>
                <ServiceError {...serviceError} />

                <div className="form-group">
                    <label className="form-label">Profile Name</label>
                    <EditableValue
                        initialValue={profile.profileName}
                        onChangeFn={(value) => updateProfileDetail("profileName", value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <EditableValue
                        initialValue={profile.displayName}
                        onChangeFn={(value) => updateProfileDetail("displayName", value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <EditableValue
                        initialValue={profile.phoneNumber}
                        onChangeFn={(value) => updateProfileDetail("phoneNumber", value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <EditableValue
                        valueType={"email"}
                        initialValue={profile.email}
                        onChangeFn={(value) => updateProfileDetail("email", value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Address</label>
                    <EditableValue
                        initialValue={profile.address}
                        onChangeFn={(value) => updateProfileDetail("address", value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Website URL</label>
                    <EditableValue
                        initialValue={profile.websiteUrl}
                        onChangeFn={(value) => updateProfileDetail("websiteUrl", value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Created At</label>
                    <div className="text-muted">{profile.createdAt}</div>
                </div>

                <div className="form-group">
                    <label className="form-label">Modified At</label>
                    <div className="text-muted">{profile.modifiedAt}</div>
                </div>
            </div>
        </div>
    );
}

export { UserProfile };
