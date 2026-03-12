#!/bin/bash
set -e

echo "Installing backend dependencies..."
cd backend
npm install
echo "Starting server..."
npm start
