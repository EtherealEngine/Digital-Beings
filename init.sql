GRANT ALL PRIVILEGES ON DATABASE digitalbeing TO digitalbeing;
CREATE TABLE IF NOT EXISTS chat_history(client_name text, chat_id text, message_id text, global_message_id text, sender text, content text, createdAt text);
CREATE TABLE IF NOT EXISTS blocked_users(user_id varchar(255), client varchar(25));
CREATE TABLE IF NOT EXISTS bad_words(word varchar(255), rating int);
CREATE TABLE IF NOT EXISTS chat_filter(half int, max int);
INSERT INTO chat_filter(half, max)
SELECT 5, 10
WHERE NOT EXISTS(SELECT * FROM chat_filter);

CREATE TABLE IF NOT EXISTS keywords(word varchar(255), count varchar(5), agent varchar(255));
INSERT INTO keywords
    select t.*
    from ((SELECT  'hi' as word, '1' as count, 'gpt3' as agent
          ) union all
          (SELECT  'hey' as word, '1' as count, 'gpt3' as agent
          ) union all
          (SELECT  'how are you' as word, '1' as count, 'gpt3' as agent
          ) union all
          (SELECT  'teach' as word, '6' as count, 'gpt3' as agent
          ) union all
          (SELECT  'lecture' as word, '10' as count, 'gpt3' as agent
          ) union all
          (SELECT  'rest' as word, '2' as count, 'gpt3' as agent
          )
         ) t
    WHERE NOT EXISTS (SELECT * FROM keywords);

CREATE TABLE IF NOT EXISTS ai_max_filter_count(count int);
INSERT INTO ai_max_filter_count(count)
SELECT 5
WHERE NOT EXISTS(SELECT * FROM ai_max_filter_count);

CREATE TABLE IF NOT EXISTS ai_chat_filter(word varchar(255), age int);
CREATE TABLE IF NOT EXISTS agent_ages(agent varchar(255), age varchar(255));