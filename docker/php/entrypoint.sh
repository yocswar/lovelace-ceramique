#!/bin/sh
set -e

if [ -f composer.json ] && [ ! -d vendor ]; then
  composer install --no-interaction --prefer-dist
fi

exec "$@"
