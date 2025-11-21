function Error({ children }) {
    return <div className="error box">
        {children}
    </div>;
}

function ServiceError({ message, hasError, children }) {
    if (!hasError) {
        return null;
    }
    return <Error>
        <div className="message">{message}</div>
        <div>{children}</div>
    </Error>;
}

export {
    Error,
    ServiceError
};
