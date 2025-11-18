#!/usr/bin/env bash

# expanded below # set -euxo pipefail
set -o errexit
set -o nounset
set -o pipefail
# set -o xtrace # disabled in production

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

did_shutdown_db=false

## function for cleaning up the running containers
cleanup() {
    ! $no_db_flag && {
        docker stop manual-meetonline-database manual-meetonline-adminer || true
        docker rm manual-meetonline-database manual-meetonline-adminer || true
        docker volume rm manual-meetonline-pgdata || true
        did_shutdown_db=true
    } || true

    ! $no_server_flag && {
        docker stop manual-meetonline-server || true
        docker rm manual-meetonline-server || true
    } || true

    ! $no_client_flag && {
        docker stop manual-meetonline-client || true
        docker rm manual-meetonline-client || true
    } || true
}

## function for building images
buildup() {
    ! $no_db_flag && {

        [ -f database/manual.Dockerfile ] || {
            echo "Error: database/manual.Dockerfile not found"
            return 1
        }

        docker build \
            --progress=plain \
            --no-cache \
            --tag localhost/meetonline-database:manual \
            --file database/manual.Dockerfile database
    } || true

    ! $no_server_flag && {

        [ -f server/node-server-app/manual.Dockerfile ] || {
            echo "Error: server/node-server-app/manual.Dockerfile not found"
            return 1
        }

        docker build \
            --progress=plain \
            --tag localhost/meetonline-server:manual \
            --file server/node-server-app/manual.Dockerfile server/node-server-app/

    } || true

    ! $no_client_flag && {

        [ -f client/react-client-app/manual.Dockerfile ] || {
            echo "Error: client/react-client-app/manual.Dockerfile not found"
            return 1
        }

        docker build \
            --progress=plain \
            --build-arg ENV_FILE=local.env \
            --tag localhost/meetonline-client:manual \
            --file client/react-client-app/manual.Dockerfile client/react-client-app/

    } || true
}

## function for running the images
runup() {

    netcreated=false
    if docker network inspect manual-meetonline-network >/dev/null 2>&1; then
        echo "Network exists."
    else
        echo "Creating network."
        docker network create manual-meetonline-network 2>/dev/null || true
        netcreated=true
    fi

    $netcreated && sleep 2

    ## checking and/or building a volume for postgres
    ! $no_db_flag && {
        volcreated=false

        if docker volume inspect manual-meetonline-pgdata >/dev/null 2>&1; then
            echo "Volume exists."
        else
            echo "Creating volume."
            docker volume create manual-meetonline-pgdata 2>/dev/null || true
            volcreated=true
        fi

        docker run \
            --name manual-meetonline-database \
            --env DB_INIT_FILE:database/init/schema.sql \
            --env-file database/local.env \
            --network manual-meetonline-network \
            --publish 5432:5432 \
            --volume manual-meetonline-pgdata:/var/lib/postgresql \
            --detach localhost/meetonline-database:manual

        docker run \
            --name manual-meetonline-adminer \
            --publish 54320:8080 \
            --detach adminer

        ($did_shutdown_db || $volcreated) && sleep 3
    } || true

    ! $no_server_flag &&
        docker run \
            --name manual-meetonline-server \
            --env-file server/node-server-app/local.env \
            --network manual-meetonline-network \
            --publish 9006:9006 \
            --publish 9443:9443 \
            --detach localhost/meetonline-server:manual &&
        sleep 2

    ! $no_client_flag &&
        docker run \
            --name manual-meetonline-client \
            --env-file client/react-client-app/local.env \
            --network manual-meetonline-network \
            --publish 5173:5173 \
            --detach localhost/meetonline-client:manual &&
        sleep 1
}

usage() {
    echo "Usage: $0 [--clean | -c] [--build | -b] [--run | -r] [--all | -a] [--no-db] [--no-server] [--no-client]"
    exit 1
}

## EXECECUTION
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

# If no flags, default to --all
if ! $clean_flag && ! $build_flag && ! $run_flag; then
    clean_flag=true
    build_flag=true
    run_flag=true
fi

$clean_flag && cleanup
$build_flag && buildup
$run_flag && runup
