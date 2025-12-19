import { useState, useEffect } from "react";

function EditableValue({ initialValue, onChangeFn, valueType, klass }) {
    const [localValue, setLocalValue] = useState(initialValue || "");
    const [dirty, setDirty] = useState(false);

    function onValueChange() {
        setDirty(false);
        onChangeFn(localValue.trim());
    }

    useEffect(() => {
        setLocalValue(initialValue || "");
    }, [initialValue]);

    return <div className={`editable flex ${klass}`} style={{ borderBottom: "1px dashed" }}>
        <input
            type={valueType || "text"}
            onChange={e => { setDirty(true); setLocalValue(e.target.value); }}
            onKeyDown={(e) => { if (e.key === "Enter" && localValue.length > 0) onValueChange(); }}
            value={localValue}
            style={{ border: dirty ? "thin solid" : "", width: "100%", minHeight: "56px" }}
        />
        {dirty && <span>*</span>}
    </div>;
}

export {
    EditableValue
};
