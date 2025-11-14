#!/usr/bin/env bash

# set -euxo pipefail

## CLI params
clean_flag=false
build_flag=false
run_flag=false
no_db_flag=false
no_server_flag=false
no_client_flag=false

## function for exiting gracefully
graceful_exit() {
    echo
    cleanup || true
    exit 130
}

# Handle CTRL+C | SIGINT | 130
trap graceful_exit INT

## function for cleaning up the running containers
cleanup() {
    ! $no_db_flag && docker stop manual-meetonline-database || true
    ! $no_db_flag && docker rm manual-meetonline-database || true

    ! $no_server_flag && docker stop manual-meetonline-server || true
    ! $no_server_flag && docker rm manual-meetonline-server || true

    ! $no_client_flag && docker stop manual-meetonline-client || true
    ! $no_client_flag && docker rm manual-meetonline-client || true
}

## function for building images
buildup() {
    ! $no_db_flag && docker build \
        --no-cache \
        --tag localhost/meetonline-database:manual \
        --file database/manual.Dockerfile database/

    ! $no_server_flag && docker build \
        --tag localhost/meetonline-server:manual \
        --file server/node-server-app/Dockerfile server/node-server-app/

    ! $no_client_flag && docker build \
        --tag localhost/meetonline-client:manual \
        --file client/react-client-app/manual.Dockerfile client/react-client-app/
}

## function for running the images
runup() {

    ## checking and/or building a volume for pgdata
    ! $no_db_flag && {
        if docker volume inspect manual-pgdata >/dev/null 2>&1; then
            echo "Volume already exists"
        else
            echo "Creating volume..."
            docker volume create manual-pgdata
        fi
    }

    ! $no_db_flag && docker run \
        --name manual-meetonline-database \
        --env-file database/local.env \
        --env-file database/docker.env \
        --publish 5432:5432 \
        --volume manual-pgdata:/var/lib/postgresql/data \
        --detach localhost/meetonline-database:manual

    ! $no_server_flag && docker run \
        --name manual-meetonline-server \
        --publish 9006:9006 \
        --publish 9443:9443 \
        --env-file server/node-server-app/local.env \
        --env-file server/node-server-app/docker.env \
        --detach localhost/meetonline-server:manual

    ! $no_client_flag && docker run \
        --name manual-meetonline-client \
        --publish 5173:5173 \
        --env-file client/react-client-app/docker.env \
        --detach localhost/meetonline-client:manual
}

usage() {
    echo "Usage: $0 [--clean | -c] [--build | -b] [--run | -r] [--all | -a] [--no-db] [--no-server] [--no-client]"
    exit 1
}

## EXECECUTE IT ALL

for arg in "$@"; do
    case "$arg" in
    -c | --clean) clean_flag=true ;;
    -b | --build) build_flag=true ;;
    -r | --run) run_flag=true ;;
    -a | --all)
        clean_flag=true
        build_flag=true
        run_flag=true
        ;;
    --no-db) no_db_flag=true ;;
    --no-server) no_server_flag=true ;;
    --no-client) no_client_flag=true ;;

    -h | --help) usage ;;
    *)
        echo "Unknown option: $arg"
        usage
        ;;
    esac
done

# ------------ EXECUTION LOGIC ------------
# If no flags, default to --all
if ! $clean_flag && ! $build_flag && ! $run_flag; then
    clean_flag=true
    build_flag=true
    run_flag=true
fi

$clean_flag && cleanup
$build_flag && buildup
$run_flag && runup
