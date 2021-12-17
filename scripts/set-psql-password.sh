#!/bin/bash
# Had Supervisor running for no reason, adding sleep, since IDK why it was here
sleep 1
su postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD 'admin123456'\" -d template1"
