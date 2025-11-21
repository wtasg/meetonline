import { useState, useEffect } from "react";

function EditableValue({ initialValue, onChangeFn, valueType }) {
    const [localValue, setLocalValue] = useState(initialValue || "");
    const [dirty, setDirty] = useState(false);

    function onValueChange() {
        setDirty(false);
        onChangeFn(localValue.trim());
    }

    useEffect(() => {
        setLocalValue(initialValue || "");
    }, [initialValue]);

    return <div className="editable flex" style={{ borderBottom: "1px dashed green" }}>
        <input
            type={valueType || "text"}
            onChange={e => { setDirty(true); setLocalValue(e.target.value); }}
            onKeyDown={(e) => { if (e.key === "Enter") onValueChange(); }}
            value={localValue}
            style={{ border: dirty ? "thin solid red" : "" }}
        />
        {dirty && <span style={{ color: "red" }}>*</span>}
    </div>;
}

export {
    EditableValue
};
