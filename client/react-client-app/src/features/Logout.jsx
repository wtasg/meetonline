function Logout({ username, onLogout }) {
    return (
        <div>
            <button onClick={onLogout}>Logout {username()}</button>
        </div>);
}

export { Logout };
