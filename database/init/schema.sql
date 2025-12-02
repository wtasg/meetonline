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
    categories                   text,

    -- Visibility and Interaction
    is_interactive             boolean   default true              not null,
    is_anonymous               boolean   default false             not null,

    -- Engagement
    interested                  text,

    -- Attachments
    attached_documents       text,

    -- other
    group_id                   bigint default null,
    created_at                 timestamp default CURRENT_TIMESTAMP not null,
    modified_at                 timestamp default CURRENT_TIMESTAMP not null,
    is_deleted                 boolean   default false             not null,
    is_hidden                  boolean   default false             not null,
    is_archived                boolean   default false             not null
);

comment on table event is 'Events created by user profiles';
comment on column event.id is 'Primary key for events table';
comment on column event.organiser_id is 'FK: profile_id who created the event';
comment on column event.organisers is 'FK: profile who created the event';
comment on column event.title is 'Title of the event or meeting';
comment on column event.description is 'Description of the event';
comment on column event.online_location is 'Meeting URL or Meeting ID';
comment on column event.start_at is 'Event start timestamp';
comment on column event.end_at is 'event end time';
comment on column event.is_paid is 'Whether the event requires payment';
comment on column event.price_amount is 'Price if the event is paid';
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
    add constraint event_organiser_id_fk
        foreign key (organiser_id) references user_profile (id);

-- Indexes
create index if not exists event_start_at_index
    on event (start_at);

create index if not exists event_organiser_id_index
    on event (organiser_id);

-- EVENT : END
