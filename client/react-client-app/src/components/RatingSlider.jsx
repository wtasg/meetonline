import { useState, useEffect } from "react";
import "./RatingSlider.css";

/**
 * Rating slider component with -5 to +5 range.
 * @param {object} props
 * @param {number} props.initialValue - Initial rating value (default: 2)
 * @param {function} props.onRatingChange - Callback when rating changes
 * @param {boolean} props.disabled - Whether the slider is disabled
 * @param {boolean} props.showLabels - Show min/max labels
 */
function RatingSlider({
    initialValue = 2,
    onRatingChange,
    disabled = false,
    showLabels = true,
}) {
    const [rating, setRating] = useState(initialValue);

    useEffect(() => {
        setRating(initialValue);
    }, [initialValue]);

    const handleChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setRating(value);
        if (onRatingChange) {
            onRatingChange(value);
        }
    };

    // Calculate background gradient position for visual feedback
    const percentage = ((rating + 5) / 10) * 100;

    // Determine color based on rating: negative=red, neutral=yellow, positive=green
    const getColor = () => {
        if (rating < 0) return "var(--color-danger)";
        if (rating > 0) return "var(--color-success)";
        return "var(--color-warning)";
    };

    // Get emoji based on rating
    const getEmoji = () => {
        if (rating <= -4) return "😠";
        if (rating <= -2) return "😞";
        if (rating < 0) return "😕";
        if (rating === 0) return "😐";
        if (rating <= 2) return "🙂";
        if (rating <= 4) return "😊";
        return "🤩";
    };

    return (
        <div className={`rating-slider ${disabled ? "rating-slider--disabled" : ""}`}>
            <div className="rating-slider__header">
                <span className="rating-slider__emoji">{getEmoji()}</span>
                <span
                    className="rating-slider__value"
                    style={{ color: getColor() }}
                >
                    {rating > 0 ? `+${rating}` : rating}
                </span>
            </div>
            <div className="rating-slider__track-container">
                {showLabels && <span className="rating-slider__label rating-slider__label--min">-5</span>}
                <input
                    type="range"
                    min="-5"
                    max="5"
                    step="1"
                    value={rating}
                    onChange={handleChange}
                    disabled={disabled}
                    className="rating-slider__input"
                    style={{
                        background: `linear-gradient(to right, ${getColor()} 0%, ${getColor()} ${percentage}%, var(--bg-tertiary) ${percentage}%, var(--bg-tertiary) 100%)`,
                    }}
                />
                {showLabels && <span className="rating-slider__label rating-slider__label--max">+5</span>}
            </div>
            <div className="rating-slider__ticks">
                {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((tick) => (
                    <span
                        key={tick}
                        className={`rating-slider__tick ${rating === tick ? "rating-slider__tick--active" : ""}`}
                    />
                ))}
            </div>
        </div>
    );
}

export { RatingSlider };
