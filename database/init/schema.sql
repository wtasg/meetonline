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

