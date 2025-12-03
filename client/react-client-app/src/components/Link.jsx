import { navigateTo } from "../hooks/useNavigate.js";

function Link({ to, children, klass }) {

    const handleClick = (e) => {
        // prevent full page load
        e.preventDefault();
        navigateTo(to);
    };

    return (
        <a href={to} onClick={handleClick} className={klass}>
            {children}
        </a>
    );
};

export { Link };
