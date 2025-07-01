#!/bin/bash
# Setup script for CRM backend

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env file created from .env.example. Please update credentials as needed."
fi

npm install

node sync-db.js
