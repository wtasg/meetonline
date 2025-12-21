function Error({ children }) {
    return <div className="box error message message--error">
        {children}
    </div>;
}

function ServiceError({ message, hasError, children }) {
    if (!hasError) {
        return null;
    }
    return <Error>
        <div>{message}</div>
        <div>{children}</div>
    </Error>;
}

export {
    Error,
    ServiceError
};
