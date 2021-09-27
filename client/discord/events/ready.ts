module.exports = (client) => {
    console.log('client ready')
    
    client.users.fetch(process.env.LOG_DM_USER_ID).then((user) => {
        client.log_user = user
    }).catch(console.error);
}