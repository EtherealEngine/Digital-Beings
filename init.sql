GRANT ALL PRIVILEGES ON DATABASE digitalbeing TO digitalbeing;
CREATE TABLE IF NOT EXISTS chat_history(client_name text, chat_id text, message_id text, global_message_id text, sender text, content text, createdAt text);
CREATE TABLE IF NOT EXISTS blocked_users(user_id varchar(255), client varchar(25));
DROP TABLE IF EXISTS chat_filter;
CREATE TABLE chat_filter(half int, max int);
INSERT INTO chat_filter(half, max) VALUES(5, 10);
CREATE TABLE IF NOT EXISTS bad_words(word varchar(255), rating int);
CREATE TABLE IF NOT EXISTS keywords(word varchar(255), count varchar(5), agent varchar(255));