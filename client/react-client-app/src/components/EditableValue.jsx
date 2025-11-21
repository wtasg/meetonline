import { useState } from "react";

function EditableValue({ initialValue, onChangeFn, valueType }) {
    initialValue = initialValue || "";
    console.log({ initialValue });
    const [localValue, setLocalValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);

    function onValueChange() {
        setIsEditing(false);
        if (localValue.length > 0) {
            onChangeFn(localValue.trim());
        }
    }

    function handleEditClick() {
        setIsEditing(true);
    }

    return <div className="editable" onClick={handleEditClick}>
        {!isEditing && (initialValue || (localValue.trim().length === 0 && <>"no-value"</>))}
        {isEditing && <input
            type={valueType || "text"}
            onChange={e => setLocalValue(e.target.value)}
            onBlur={onValueChange}
            value={localValue}
            autoFocus
        />}

    </div>;
}

export {
    EditableValue
};
