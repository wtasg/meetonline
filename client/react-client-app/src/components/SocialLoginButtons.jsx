
import { triggerOAuthLoginAction } from "../actions/oauthActions";

function SocialLoginButtons({ mode = "login" }) {
    // mode can be "login" or "connect"
    const providers = [
        { id: "google", name: "Google", color: "#DB4437" },
        { id: "microsoft", name: "Microsoft", color: "#00A4EF" },
        { id: "facebook", name: "Facebook", color: "#4267B2" },
        { id: "apple", name: "Apple", color: "#000000" }
    ];

    const handleSocialAction = (provider) => {
        triggerOAuthLoginAction(provider, mode);
    };

    return (
        <div className="vflex gap-2 w-full">
            <div className="flex hac vac gap-2 my-2">
                <hr className="flex-1" />
                <span className="text-muted text-sm">Or {mode === "login" ? "login" : "connect"} with</span>
                <hr className="flex-1" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                {providers.map(p => (
                    <button
                        key={p.id}
                        type="button"
                        className="btn btn-secondary flex hac vac gap-2 py-2"
                        style={{ borderColor: p.color, color: "var(--text-primary)" }}
                        onClick={() => handleSocialAction(p.id)}
                    >
                        <span className="text-sm font-medium">{p.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export { SocialLoginButtons };
