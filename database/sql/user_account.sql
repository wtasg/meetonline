create table public.user_account
(
    id           bigserial                           not null,
    username     varchar(64)                         not null,
    salt         varchar(256)                        not null,
    password     varchar(64)                         not null,
    created_at   timestamp default current_timestamp not null,
    is_active    boolean   default true              not null,
    is_deleted   boolean   default false             not null,
    is_blocked   boolean   default false             not null,
    is_forgotten boolean   default false             not null,
    modified_at  timestamp default current_timestamp not null
);

create unique index user_account_username_uindex
    on public.user_account (username);

alter table public.user_account
    add constraint user_account_pk
        primary key (username);

