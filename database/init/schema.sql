-- USER ACCOUNT : START
create table if not exists user_account
(
    id           bigserial,
    username     varchar(1024)                       not null,
    salt         varchar(1024)                       not null,
    password     varchar(1024)                       not null,
    created_at   timestamp default CURRENT_TIMESTAMP not null,
    is_active    boolean   default true              not null,
    is_deleted   boolean   default false             not null,
    is_blocked   boolean   default false             not null,
    is_forgotten boolean   default false             not null,
    modified_at  timestamp default CURRENT_TIMESTAMP not null
);

alter table user_account
    owner to myuser;

create unique index if not exists user_account_username_uindex
    on user_account (username);

alter table user_account
    add constraint user_account_pk_2
        primary key (id);

alter table user_account
    add constraint user_account_pk
        unique (username);

-- USER ACCOUNT : END


-- KEY VALUE STORE : START
create table if not exists kv_store
(
    id         bigserial,
    k          varchar(1024)                       not null,
    v          varchar(1024)                       not null,
    created_at timestamp default CURRENT_TIMESTAMP not null
);

alter table kv_store
    owner to myuser;

create unique index if not exists kv_store_k_uindex
    on kv_store (k);

alter table kv_store
    add constraint kv_store_pk
        primary key (k);


-- USER PROFILE : START
create table if not exists user_profile
(
    id           bigserial,
    user_id      bigint                              not null,
    profile_name varchar(128),
    display_name varchar(128)                        not null,
    phone_number varchar(128),
    email        varchar(128),
    address      varchar(512),
    website_url  varchar(128),
    created_at   timestamp default CURRENT_TIMESTAMP not null,
    modified_at  timestamp default CURRENT_TIMESTAMP not null
);

comment on column user_profile.id is 'user profile id';

comment on column user_profile.user_id is 'user account id';

comment on column user_profile.profile_name is 'user''s profile''s name';

comment on column user_profile.display_name is 'user''s public display name';

alter table user_profile
    owner to myuser;

alter table user_profile
    add constraint user_profile_pk
        unique (id);

alter table user_profile
    add constraint user_profile_user_account_id_fk
        foreign key (user_id) references user_account;

-- USER PROFILE : END

-- EVENT : START
create table if not exists event
(
    id                         bigserial,

    -- Orgnisers
    organiser_id               bigint                              not null,
    organisers                  text,

    -- Event fields
    title                      varchar(1024)                       not null,
    description                text,
    online_location            varchar(1024),

    -- Timing
    start_at                   timestamp                           not null,
    end_at                     timestamp                           not null,

    -- Payment
    is_paid                    boolean   default false             not null,

    -- Broadcast
    is_broadcast               boolean   default false             not null,
    broadcast_type             varchar(64),

    -- Tags and Categories
    tags                       text,
    categories                 text,

    -- Visibility and Interaction
    is_interactive             boolean   default true              not null,
    is_anonymous               boolean   default false             not null,

    -- Engagement
    interested                 text,

    -- Attachments
    attached_documents         text,

    -- other
    group_id                   bigint default null,
    created_at                 timestamp default    CURRENT_TIMESTAMP   not null,
    modified_at                timestamp default    CURRENT_TIMESTAMP   not null,
    is_deleted                 boolean   default    false               not null,
    is_hidden                  boolean   default    false               not null,
    is_archived                boolean   default    false               not null
);

comment on table event is 'Events created by user profiles';
comment on column event.id is 'Primary key for events table';
comment on column event.organiser_id is 'FK: profile_id who created the event';
comment on column event.organisers is 'FK: profile who created the event';
comment on column event.title is 'Title of the event or meeting';
comment on column event.description is 'Description of the event';
comment on column event.online_location is 'Meeting URL or Meeting ID';
comment on column event.start_at is 'Event start timestamp';
comment on column event.end_at is 'Event end time';
comment on column event.is_paid is 'Whether the event requires payment';
comment on column event.is_broadcast is 'Whether the event is a broadcast (YT Live, Twitch, prerecorded)';
comment on column event.broadcast_type is 'Type of broadcast: youtube, twitch, prerecorded';
comment on column event.tags is 'hashtag for event';
comment on column event.categories is 'categories for event';
comment on column event.is_interactive is 'Will organiser interact with attendees?';
comment on column event.is_anonymous is 'Whether attendees can join anonymously';
comment on column event.interested is 'interested users';
comment on column event.attached_documents is 'attach document link';
comment on column event.group_id is 'Reserved for groups feature';
comment on column event.created_at is 'Record creation timestamp';
comment on column event.modified_at is 'Record update timestamp';
comment on column event.is_deleted is 'delete flag';
comment on column event.is_hidden is 'whether event is hidden from public listing';
comment on column event.is_archived is 'whether event is archived';

alter table event
    owner to myuser;

-- Primary Key
alter table event
    add constraint event_pk
        primary key (id);

-- Foreign Keys
alter table event
    add constraint event_end_after_start_check
        check (end_at > start_at);

alter table event
    add constraint event_broadcast_type_check
        check (broadcast_type IS NULL OR broadcast_type IN ('youtube', 'twitch', 'prerecorded'));
-- Indexes
create index if not exists event_start_at_index
    on event (start_at);

create index if not exists event_organiser_id_index
    on event (organiser_id);

create index if not exists event_is_hidden_index
    on event (is_hidden);

create index if not exists event_is_archived_index
    on event (is_archived);

create index if not exists event_created_at_desc_index
    on event (created_at desc);
-- EVENT : END


-- GROUP : START
create table if not exists "group"
(
    id                         bigserial,
    user_profile_id            bigint                              not null,
    group_name                 varchar(256)                        not null,
    description                text,
    is_public                  boolean   default true              not null,
    members                    text,
    tags                       text,
    categories                 text,
    created_at                 timestamp default CURRENT_TIMESTAMP not null,
    modified_at                timestamp default CURRENT_TIMESTAMP not null,
    is_deleted                 boolean   default false             not null,
    is_hidden                  boolean   default false             not null,
    is_archived                boolean   default false             not null
);

comment on table "group" is 'Groups created by user profiles';
comment on column "group".id is 'Primary key for groups table';
comment on column "group".user_profile_id is 'FK: profile_id who created the group';
comment on column "group".group_name is 'Name of the group';
comment on column "group".description is 'Description of the group';
comment on column "group".is_public is 'Whether the group is publicly searchable';
comment on column "group".members is 'JSON array of member user_profile_ids';
comment on column "group".tags is 'Tags for the group';
comment on column "group".categories is 'Categories for the group';
comment on column "group".created_at is 'Record creation timestamp';
comment on column "group".modified_at is 'Record update timestamp';
comment on column "group".is_deleted is 'Soft delete flag';
comment on column "group".is_hidden is 'Whether group is hidden from public listing';
comment on column "group".is_archived is 'Whether group is archived';

alter table "group"
    owner to myuser;

-- Primary Key
alter table "group"
    add constraint group_pk
        primary key (id);

-- Foreign Keys
alter table "group"
    add constraint group_user_profile_id_fk
        foreign key (user_profile_id) references user_profile(id);

-- Indexes
create index if not exists group_user_profile_id_index
    on "group" (user_profile_id);

create index if not exists group_group_name_index
    on "group" (group_name);

create index if not exists group_is_public_index
    on "group" (is_public);

create index if not exists group_is_hidden_index
    on "group" (is_hidden);

create index if not exists group_is_archived_index
    on "group" (is_archived);

create index if not exists group_is_deleted_index
    on "group" (is_deleted);

create index if not exists group_created_at_desc_index
    on "group" (created_at desc);

-- GROUP : END


-- USER SETTINGS : START
create table if not exists user_settings
(
    id                  bigserial,
    user_profile_id     bigint                              not null,
    theme               varchar(64)   default 'system'      not null,
    font_size           varchar(32)   default 'medium'      not null,
    font_family         varchar(128)  default 'system-ui'   not null,
    font_contrast       varchar(32)   default 'normal'      not null,
    notifications       boolean       default true          not null,
    online_presence     boolean       default true          not null,
    sounds              boolean       default true          not null,
    created_at          timestamp     default CURRENT_TIMESTAMP not null,
    modified_at         timestamp     default CURRENT_TIMESTAMP not null
);

comment on table user_settings is 'User settings per profile';
comment on column user_settings.id is 'Primary key for user_settings table';
comment on column user_settings.user_profile_id is 'FK: user_profile.id';
comment on column user_settings.theme is 'UI theme: system, light, dark, high-contrast-light, high-contrast-dark, teal, pink, red, sepia, gray';
comment on column user_settings.font_size is 'Font size: small, medium, large, x-large';
comment on column user_settings.font_family is 'Font family';
comment on column user_settings.font_contrast is 'Font contrast: low, normal, high';
comment on column user_settings.notifications is 'Enable notifications';
comment on column user_settings.online_presence is 'Show online presence';
comment on column user_settings.sounds is 'Enable sounds';
comment on column user_settings.created_at is 'Record creation timestamp';
comment on column user_settings.modified_at is 'Record update timestamp';

alter table user_settings
    owner to myuser;

alter table user_settings
    add constraint user_settings_pk
        primary key (id);

alter table user_settings
    add constraint user_settings_user_profile_id_uindex
        unique (user_profile_id);

alter table user_settings
    add constraint user_settings_user_profile_id_fk
        foreign key (user_profile_id) references user_profile (id);

alter table user_settings
    add constraint user_settings_theme_check
        check (theme IN ('system', 'light', 'dark', 'high-contrast-light', 'high-contrast-dark', 'teal', 'pink', 'red', 'sepia', 'gray'));

alter table user_settings
    add constraint user_settings_font_size_check
        check (font_size IN ('small', 'medium', 'large', 'x-large'));

alter table user_settings
    add constraint user_settings_font_contrast_check
        check (font_contrast IN ('low', 'normal', 'high'));

create index if not exists user_settings_user_profile_id_index
    on user_settings (user_profile_id);

-- USER SETTINGS : END


-- JWT TOKENS : START
create table if not exists jwt_tokens
(
    id                          bigserial,
    user_id                     bigint                              not null,
    access_token                varchar(1024)                       not null,
    refresh_token               varchar(1024)                       not null,
    access_token_expires_at     timestamp                           not null,
    refresh_token_expires_at    timestamp                           not null,
    is_revoked                  boolean   default false             not null,
    created_at                  timestamp default CURRENT_TIMESTAMP not null,
    modified_at                 timestamp default CURRENT_TIMESTAMP not null
);

comment on table jwt_tokens is 'JWT tokens for user authentication';
comment on column jwt_tokens.id is 'Primary key for jwt_tokens table';
comment on column jwt_tokens.user_id is 'FK: user_account.id';
comment on column jwt_tokens.access_token is 'JWT access token';
comment on column jwt_tokens.refresh_token is 'JWT refresh token';
comment on column jwt_tokens.access_token_expires_at is 'Access token expiration timestamp';
comment on column jwt_tokens.refresh_token_expires_at is 'Refresh token expiration timestamp';
comment on column jwt_tokens.is_revoked is 'Whether the token pair has been revoked';
comment on column jwt_tokens.created_at is 'Record creation timestamp';
comment on column jwt_tokens.modified_at is 'Record update timestamp';

alter table jwt_tokens
    owner to myuser;

alter table jwt_tokens
    add constraint jwt_tokens_pk
        primary key (id);

alter table jwt_tokens
    add constraint jwt_tokens_user_id_fk
        foreign key (user_id) references user_account(id);

create index if not exists jwt_tokens_user_id_index
    on jwt_tokens (user_id);

create index if not exists jwt_tokens_access_token_index
    on jwt_tokens (access_token);

create index if not exists jwt_tokens_refresh_token_index
    on jwt_tokens (refresh_token);

create index if not exists jwt_tokens_is_revoked_index
    on jwt_tokens (is_revoked);

-- JWT TOKENS : END


-- SEARCH QUERIES : START
create table if not exists search_queries
(
    id                  bigserial,
    user_id             bigint                              not null,
    search_term         varchar(1024)                       not null,
    search_types        text,
    results_count       integer   default 0                 not null,
    created_at          timestamp default CURRENT_TIMESTAMP not null
);

comment on table search_queries is 'Search queries performed by users';
comment on column search_queries.id is 'Primary key for search_queries table';
comment on column search_queries.user_id is 'FK: user_account.id';
comment on column search_queries.search_term is 'The search term used';
comment on column search_queries.search_types is 'Comma-separated list of types searched (users, events, groups)';
comment on column search_queries.results_count is 'Total number of results returned';
comment on column search_queries.created_at is 'Record creation timestamp';

alter table search_queries
    owner to myuser;

alter table search_queries
    add constraint search_queries_pk
        primary key (id);

alter table search_queries
    add constraint search_queries_user_id_fk
        foreign key (user_id) references user_account(id);

create index if not exists search_queries_user_id_index
    on search_queries (user_id);

create index if not exists search_queries_search_term_index
    on search_queries (search_term);

create index if not exists search_queries_created_at_index
    on search_queries (created_at desc);

-- SEARCH QUERIES : END


-- USER NOTIFICATIONS : START
create table if not exists user_notifications
(
    id                  bigserial,
    user_profile_id     bigint                              not null,
    type                varchar(64)                         not null,
    source              varchar(128),
    message             text                                not null,
    created_at          timestamp default CURRENT_TIMESTAMP not null,
    is_read             boolean   default false             not null,
    read_at             timestamp,
    is_deleted          boolean   default false             not null,
    deleted_at          timestamp
);

comment on table user_notifications is 'User notifications';
comment on column user_notifications.id is 'Primary key for user_notifications table';
comment on column user_notifications.user_profile_id is 'FK: user_profile.id';
comment on column user_notifications.type is 'Type of notification: comment, event_create, event_modify, event_delete, group_create, group_modify, group_delete, message, system, other';
comment on column user_notifications.source is 'Source ID (profile_id, event_id, group_id, etc.)';
comment on column user_notifications.message is 'Notification message text';
comment on column user_notifications.created_at is 'Record creation timestamp';
comment on column user_notifications.is_read is 'Whether the notification has been read';
comment on column user_notifications.read_at is 'Timestamp when notification was marked as read';
comment on column user_notifications.is_deleted is 'Soft delete flag';
comment on column user_notifications.deleted_at is 'Timestamp when notification was deleted';

alter table user_notifications
    owner to myuser;

alter table user_notifications
    add constraint user_notifications_pk
        primary key (id);

alter table user_notifications
    add constraint user_notifications_user_profile_id_fk
        foreign key (user_profile_id) references user_profile(id);

alter table user_notifications
    add constraint user_notifications_type_check
        check (type IN ('comment', 'event_create', 'event_modify', 'event_delete', 'group_create', 'group_modify', 'group_delete', 'message', 'system', 'other'));

create index if not exists user_notifications_user_profile_id_index
    on user_notifications (user_profile_id);

create index if not exists user_notifications_is_read_index
    on user_notifications (is_read);

create index if not exists user_notifications_is_deleted_index
    on user_notifications (is_deleted);

create index if not exists user_notifications_created_at_desc_index
    on user_notifications (created_at desc);

-- USER NOTIFICATIONS : END
