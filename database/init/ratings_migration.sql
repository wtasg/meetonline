-- =====================================================
-- RATINGS SYSTEM MIGRATION
-- =====================================================
-- This migration adds tables for the ratings and attendance system:
-- - group_members: Proper membership tracking for groups
-- - group_events: Links events to groups (many-to-many)
-- - event_attendance: Token-based attendance tracking
-- - event_ratings: User ratings for events
-- - group_ratings: User ratings for groups
-- - organizer_ratings: User ratings for organizers
-- - member_ratings: Organizer ratings for members
-- =====================================================


-- GROUP MEMBERS : START
-- Replaces the comma-separated `members` column in `group` table
CREATE TABLE IF NOT EXISTS group_members
(
    id                     BIGSERIAL PRIMARY KEY,
    group_id               BIGINT NOT NULL REFERENCES "group"(id) ON DELETE CASCADE,
    user_profile_id        BIGINT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    role                   VARCHAR(32) DEFAULT 'member' NOT NULL,
    consecutive_attendance INTEGER DEFAULT 0 NOT NULL,
    regularity_token       UUID,
    joined_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active              BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(group_id, user_profile_id)
);

COMMENT ON TABLE group_members IS 'Group membership tracking';
COMMENT ON COLUMN group_members.id IS 'Primary key';
COMMENT ON COLUMN group_members.group_id IS 'FK: group.id';
COMMENT ON COLUMN group_members.user_profile_id IS 'FK: user_profile.id';
COMMENT ON COLUMN group_members.role IS 'Member role: admin, moderator, member';
COMMENT ON COLUMN group_members.consecutive_attendance IS 'Count of consecutive event attendances';
COMMENT ON COLUMN group_members.regularity_token IS 'UUID token awarded after 5 consecutive attendances';
COMMENT ON COLUMN group_members.joined_at IS 'When the user joined the group';
COMMENT ON COLUMN group_members.is_active IS 'Whether membership is active';

ALTER TABLE group_members OWNER TO myuser;

ALTER TABLE group_members
    ADD CONSTRAINT group_members_role_check
        CHECK (role IN ('admin', 'moderator', 'member'));

CREATE INDEX IF NOT EXISTS group_members_group_id_index
    ON group_members (group_id);

CREATE INDEX IF NOT EXISTS group_members_user_profile_id_index
    ON group_members (user_profile_id);

CREATE INDEX IF NOT EXISTS group_members_is_active_index
    ON group_members (is_active);

-- GROUP MEMBERS : END


-- GROUP EVENTS : START
-- Links events to groups (many-to-many relationship)
CREATE TABLE IF NOT EXISTS group_events
(
    id         BIGSERIAL PRIMARY KEY,
    group_id   BIGINT NOT NULL REFERENCES "group"(id) ON DELETE CASCADE,
    event_id   BIGINT NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(group_id, event_id)
);

COMMENT ON TABLE group_events IS 'Links events to groups';
COMMENT ON COLUMN group_events.id IS 'Primary key';
COMMENT ON COLUMN group_events.group_id IS 'FK: group.id';
COMMENT ON COLUMN group_events.event_id IS 'FK: event.id';
COMMENT ON COLUMN group_events.created_at IS 'When the event was linked to the group';

ALTER TABLE group_events OWNER TO myuser;

CREATE INDEX IF NOT EXISTS group_events_group_id_index
    ON group_events (group_id);

CREATE INDEX IF NOT EXISTS group_events_event_id_index
    ON group_events (event_id);

-- GROUP EVENTS : END


-- EVENT ATTENDANCE : START
-- Tracks attendance tokens and presence for events
CREATE TABLE IF NOT EXISTS event_attendance
(
    id            BIGSERIAL PRIMARY KEY,
    event_id      BIGINT NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    start_token   UUID NOT NULL,
    mid_token     UUID NOT NULL,
    end_token     UUID NOT NULL,
    start_present TEXT,  -- comma-separated user_profile.ids
    mid_present   TEXT,
    end_present   TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(event_id)
);

COMMENT ON TABLE event_attendance IS 'Event attendance tracking with tokens';
COMMENT ON COLUMN event_attendance.id IS 'Primary key';
COMMENT ON COLUMN event_attendance.event_id IS 'FK: event.id';
COMMENT ON COLUMN event_attendance.start_token IS 'UUID token for start of event';
COMMENT ON COLUMN event_attendance.mid_token IS 'UUID token for midpoint of event';
COMMENT ON COLUMN event_attendance.end_token IS 'UUID token for end of event';
COMMENT ON COLUMN event_attendance.start_present IS 'Comma-separated user_profile.ids present at start';
COMMENT ON COLUMN event_attendance.mid_present IS 'Comma-separated user_profile.ids present at mid';
COMMENT ON COLUMN event_attendance.end_present IS 'Comma-separated user_profile.ids present at end';
COMMENT ON COLUMN event_attendance.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN event_attendance.modified_at IS 'Record update timestamp';

ALTER TABLE event_attendance OWNER TO myuser;

CREATE INDEX IF NOT EXISTS event_attendance_event_id_index
    ON event_attendance (event_id);

-- EVENT ATTENDANCE : END


-- EVENT RATINGS : START
CREATE TABLE IF NOT EXISTS event_ratings
(
    id              BIGSERIAL PRIMARY KEY,
    event_id        BIGINT NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    user_profile_id BIGINT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    rating          INTEGER NOT NULL,
    status          VARCHAR(32) DEFAULT 'unread' NOT NULL,
    comment         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(event_id, user_profile_id)
);

COMMENT ON TABLE event_ratings IS 'User ratings for events';
COMMENT ON COLUMN event_ratings.id IS 'Primary key';
COMMENT ON COLUMN event_ratings.event_id IS 'FK: event.id';
COMMENT ON COLUMN event_ratings.user_profile_id IS 'FK: user_profile.id of rater';
COMMENT ON COLUMN event_ratings.rating IS 'Rating value (-5 to +5)';
COMMENT ON COLUMN event_ratings.status IS 'Rating status: unread, accepted, rejected, disputed, invalid';
COMMENT ON COLUMN event_ratings.comment IS 'Optional comment with the rating';
COMMENT ON COLUMN event_ratings.created_at IS 'Record creation timestamp';

ALTER TABLE event_ratings OWNER TO myuser;

ALTER TABLE event_ratings
    ADD CONSTRAINT event_ratings_rating_check
        CHECK (rating >= -5 AND rating <= 5);

ALTER TABLE event_ratings
    ADD CONSTRAINT event_ratings_status_check
        CHECK (status IN ('unread', 'accepted', 'rejected', 'disputed', 'invalid'));

CREATE INDEX IF NOT EXISTS event_ratings_event_id_index
    ON event_ratings (event_id);

CREATE INDEX IF NOT EXISTS event_ratings_user_profile_id_index
    ON event_ratings (user_profile_id);

CREATE INDEX IF NOT EXISTS event_ratings_status_index
    ON event_ratings (status);

-- EVENT RATINGS : END


-- GROUP RATINGS : START
CREATE TABLE IF NOT EXISTS group_ratings
(
    id              BIGSERIAL PRIMARY KEY,
    group_id        BIGINT NOT NULL REFERENCES "group"(id) ON DELETE CASCADE,
    user_profile_id BIGINT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    rating          INTEGER NOT NULL,
    status          VARCHAR(32) DEFAULT 'unread' NOT NULL,
    comment         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(group_id, user_profile_id)
);

COMMENT ON TABLE group_ratings IS 'User ratings for groups';
COMMENT ON COLUMN group_ratings.id IS 'Primary key';
COMMENT ON COLUMN group_ratings.group_id IS 'FK: group.id';
COMMENT ON COLUMN group_ratings.user_profile_id IS 'FK: user_profile.id of rater';
COMMENT ON COLUMN group_ratings.rating IS 'Rating value (-5 to +5)';
COMMENT ON COLUMN group_ratings.status IS 'Rating status: unread, accepted, rejected, disputed, invalid';
COMMENT ON COLUMN group_ratings.comment IS 'Optional comment with the rating';
COMMENT ON COLUMN group_ratings.created_at IS 'Record creation timestamp';

ALTER TABLE group_ratings OWNER TO myuser;

ALTER TABLE group_ratings
    ADD CONSTRAINT group_ratings_rating_check
        CHECK (rating >= -5 AND rating <= 5);

ALTER TABLE group_ratings
    ADD CONSTRAINT group_ratings_status_check
        CHECK (status IN ('unread', 'accepted', 'rejected', 'disputed', 'invalid'));

CREATE INDEX IF NOT EXISTS group_ratings_group_id_index
    ON group_ratings (group_id);

CREATE INDEX IF NOT EXISTS group_ratings_user_profile_id_index
    ON group_ratings (user_profile_id);

CREATE INDEX IF NOT EXISTS group_ratings_status_index
    ON group_ratings (status);

-- GROUP RATINGS : END


-- ORGANIZER RATINGS : START
CREATE TABLE IF NOT EXISTS organizer_ratings
(
    id           BIGSERIAL PRIMARY KEY,
    organizer_id BIGINT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    rater_id     BIGINT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    context_type VARCHAR(32) NOT NULL,
    context_id   BIGINT NOT NULL,
    rating       INTEGER NOT NULL,
    status       VARCHAR(32) DEFAULT 'unread' NOT NULL,
    comment      TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(organizer_id, rater_id, context_type, context_id)
);

COMMENT ON TABLE organizer_ratings IS 'User ratings for organizers';
COMMENT ON COLUMN organizer_ratings.id IS 'Primary key';
COMMENT ON COLUMN organizer_ratings.organizer_id IS 'FK: user_profile.id of organizer being rated';
COMMENT ON COLUMN organizer_ratings.rater_id IS 'FK: user_profile.id of user giving rating';
COMMENT ON COLUMN organizer_ratings.context_type IS 'Context: event or group';
COMMENT ON COLUMN organizer_ratings.context_id IS 'ID of the event or group';
COMMENT ON COLUMN organizer_ratings.rating IS 'Rating value (-5 to +5)';
COMMENT ON COLUMN organizer_ratings.status IS 'Rating status: unread, accepted, rejected, disputed, invalid';
COMMENT ON COLUMN organizer_ratings.comment IS 'Optional comment with the rating';
COMMENT ON COLUMN organizer_ratings.created_at IS 'Record creation timestamp';

ALTER TABLE organizer_ratings OWNER TO myuser;

ALTER TABLE organizer_ratings
    ADD CONSTRAINT organizer_ratings_rating_check
        CHECK (rating >= -5 AND rating <= 5);

ALTER TABLE organizer_ratings
    ADD CONSTRAINT organizer_ratings_status_check
        CHECK (status IN ('unread', 'accepted', 'rejected', 'disputed', 'invalid'));

ALTER TABLE organizer_ratings
    ADD CONSTRAINT organizer_ratings_context_type_check
        CHECK (context_type IN ('event', 'group'));

CREATE INDEX IF NOT EXISTS organizer_ratings_organizer_id_index
    ON organizer_ratings (organizer_id);

CREATE INDEX IF NOT EXISTS organizer_ratings_rater_id_index
    ON organizer_ratings (rater_id);

CREATE INDEX IF NOT EXISTS organizer_ratings_context_index
    ON organizer_ratings (context_type, context_id);

CREATE INDEX IF NOT EXISTS organizer_ratings_status_index
    ON organizer_ratings (status);

-- ORGANIZER RATINGS : END


-- MEMBER RATINGS : START
CREATE TABLE IF NOT EXISTS member_ratings
(
    id           BIGSERIAL PRIMARY KEY,
    member_id    BIGINT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    rater_id     BIGINT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    context_type VARCHAR(32) NOT NULL,
    context_id   BIGINT NOT NULL,
    rating       INTEGER NOT NULL,
    status       VARCHAR(32) DEFAULT 'unread' NOT NULL,
    comment      TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(member_id, rater_id, context_type, context_id)
);

COMMENT ON TABLE member_ratings IS 'Organizer ratings for members';
COMMENT ON COLUMN member_ratings.id IS 'Primary key';
COMMENT ON COLUMN member_ratings.member_id IS 'FK: user_profile.id of member being rated';
COMMENT ON COLUMN member_ratings.rater_id IS 'FK: user_profile.id of organizer giving rating';
COMMENT ON COLUMN member_ratings.context_type IS 'Context: event or group';
COMMENT ON COLUMN member_ratings.context_id IS 'ID of the event or group';
COMMENT ON COLUMN member_ratings.rating IS 'Rating value (-5 to +5)';
COMMENT ON COLUMN member_ratings.status IS 'Rating status: unread, accepted, rejected, disputed, invalid';
COMMENT ON COLUMN member_ratings.comment IS 'Optional comment with the rating';
COMMENT ON COLUMN member_ratings.created_at IS 'Record creation timestamp';

ALTER TABLE member_ratings OWNER TO myuser;

ALTER TABLE member_ratings
    ADD CONSTRAINT member_ratings_rating_check
        CHECK (rating >= -5 AND rating <= 5);

ALTER TABLE member_ratings
    ADD CONSTRAINT member_ratings_status_check
        CHECK (status IN ('unread', 'accepted', 'rejected', 'disputed', 'invalid'));

ALTER TABLE member_ratings
    ADD CONSTRAINT member_ratings_context_type_check
        CHECK (context_type IN ('event', 'group'));

CREATE INDEX IF NOT EXISTS member_ratings_member_id_index
    ON member_ratings (member_id);

CREATE INDEX IF NOT EXISTS member_ratings_rater_id_index
    ON member_ratings (rater_id);

CREATE INDEX IF NOT EXISTS member_ratings_context_index
    ON member_ratings (context_type, context_id);

CREATE INDEX IF NOT EXISTS member_ratings_status_index
    ON member_ratings (status);

-- MEMBER RATINGS : END
