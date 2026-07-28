#!/bin/bash
lsof -ti :3001 | xargs kill -9 2>/dev/null
sleep 2
cd backend && npm run start:dev
