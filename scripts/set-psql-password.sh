/usr/bin/supervisord &
sleep 10
su postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD 'admin123456'\" -d template1"
