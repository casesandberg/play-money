#!/bin/bash

set -xe

function wait_for_db() {
  until pg_isready -h $POSTGRES_HOST -p 5432; do
    echo "Waiting for the database to be accessible..."
    sleep 2
  done
}

wait_for_db

npx prisma migrate dev

# ignore failures below, probably best to remove this once
# it's clear why HOUSE user isn't being populated by default
npx prisma db seed || true

npm run dev