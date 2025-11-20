import { useState } from "react";

function EditableValue({ initialValue, onChange }) {
    const [localValue, setLocalValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(!initialValue);

    function onValueChange() {
        if (localValue) {
            setIsEditing(false);
            onChange(localValue);
        }
    }

    return <div
        onClick={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
    >
        {isEditing && <input
            type="text"
            onChange={e => setLocalValue(e.target.value)}
            onBlur={onValueChange}
            value={localValue}
        />}
        {!isEditing && localValue}
    </div>;
}

export {
    EditableValue
};
