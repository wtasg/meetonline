function Logout({ username, onLogout }) {
    return (<>
        <button onClick={onLogout}>Logout {username()}</button>
    </>);
}

export { Logout };
