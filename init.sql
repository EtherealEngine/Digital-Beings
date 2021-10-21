GRANT ALL PRIVILEGES ON DATABASE digitalbeing TO digitalbeing;
CREATE TABLE IF NOT EXISTS chat_history(client_name text, chat_id text, message_id text, global_message_id text, sender text, content text, createdAt text);
CREATE TABLE IF NOT EXISTS blocked_users(user_id varchar(255), client varchar(25));