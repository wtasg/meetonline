function Logout({ username, onlogout }) {
    return (<>
        <button onClick={onlogout}>Logout {username()}</button>
    </>);
}

export { Logout };
