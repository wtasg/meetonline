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

comment on column user_profile.user_id is 'user account it';

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

-- EVENTS : START
create table if not exists events
(
    event_id                   bigserial,
    chief_organiser_profile_id bigint                              not null,
    title                      varchar(1024)                       not null,
    description                text,
    online_location            text,
    start_at                   timestamp                           not null,
    end_at                     timestamp,
    is_paid                    boolean   default false             not null,
    price_amount               numeric(12,2),
    currency                   char(3),
    is_broadcast               boolean   default false             not null,
    broadcast_type             varchar(64),
    is_interactive             boolean   default true              not null,
    is_anonymous               boolean   default false             not null,
    category_id                bigint,
    theme                      varchar(255),
    attached_document_id       bigint,
    group_id                   bigint default null,
    created_at                 timestamp default CURRENT_TIMESTAMP not null,
    updated_at                 timestamp default CURRENT_TIMESTAMP not null,
    is_deleted                 boolean   default false             not null
);

comment on table events is 'Events created by user profiles';
comment on column events.event_id is 'Primary key for events table';
comment on column events.chief_organiser_profile_id is 'FK: profile who created the event';
comment on column events.title is 'Title of the event or meeting';
comment on column events.description is 'Description of the event';
comment on column events.online_location is 'Meeting URL or Meeting ID';
comment on column events.start_at is 'Event start timestamp';
comment on column events.end_at is 'Optional event end time';
comment on column events.is_paid is 'Whether the event requires payment';
comment on column events.price_amount is 'Price if the event is paid';
comment on column events.currency is 'Currency code (example: USD, INR)';
comment on column events.is_broadcast is 'Whether the event is a broadcast (YT Live, Twitch, prerecorded)';
comment on column events.broadcast_type is 'Type of broadcast: youtube, twitch, prerecorded';
comment on column events.is_interactive is 'Will organiser interact with attendees?';
comment on column events.is_anonymous is 'Whether attendees can join anonymously';
comment on column events.category_id is 'FK to categories table';
comment on column events.theme is 'Optional theme text';
comment on column events.attached_document_id is 'FK to documents table';
comment on column events.group_id is 'Reserved for groups feature';
comment on column events.created_at is 'Record creation timestamp';
comment on column events.updated_at is 'Record update timestamp';
comment on column events.is_deleted is 'Soft delete flag';

alter table events
    owner to myuser;

-- Primary Key
alter table events
    add constraint events_pk
        primary key (event_id);

-- Foreign Keys
alter table events
    add constraint events_chief_organiser_profile_id_fk
        foreign key (chief_organiser_profile_id) references user_profile (id);

alter table events
    add constraint events_category_id_fk
        foreign key (category_id) references categories (category_id);

alter table events
    add constraint events_attached_document_id_fk
        foreign key (attached_document_id) references documents (document_id);

-- Indexes
create index if not exists events_start_at_index
    on events (start_at);

create index if not exists events_chief_organiser_profile_index
    on events (chief_organiser_profile_id);

-- EVENTS : END


