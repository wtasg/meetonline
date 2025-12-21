import { navigateTo } from "../hooks/useNavigate.js";

function Link({ to, children, klass }) {

    const handleClick = (e) => {
        // prevent full page load
        e.preventDefault();
        navigateTo(to);
    };

    return (
        <a
            href={to}
            onClick={handleClick}
            className={`${klass ? klass : ""} clickable nav-link`}>
            {children}
        </a>
    );
}

export { Link };
