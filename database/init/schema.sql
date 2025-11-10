create table if not exists public.user_account
(
    id           bigserial                           not null,
    username     varchar(1024)                         not null constraint user_account_pk primary key,
    salt         varchar(1024)                        not null,
    password     varchar(1024)                         not null,
    created_at   timestamp default current_timestamp not null,
    is_active    boolean   default true              not null,
    is_deleted   boolean   default false             not null,
    is_blocked   boolean   default false             not null,
    is_forgotten boolean   default false             not null,
    modified_at  timestamp default current_timestamp not null
);

create unique index user_account_username_uindex
    on public.user_account (username);


-- KEY-VALUE Pair storage
create table if not exists public.kv_store
(
    id          bigserial         not null,
    k           varchar(1024)     not null constraint kv_store_pk primary key,
    v           varchar(1024)     not null,
    created_at  timestamp default CURRENT_TIMESTAMP not null
);

create unique index kv_store_k_uindex
    on public.kv_store (k);
