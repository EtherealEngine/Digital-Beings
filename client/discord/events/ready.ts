module.exports = (client) => {
    console.log('client ready')
    const guild = client.guilds.cache.get(process.env.DISCORD_SERVER_ID)
    const user = client.users.cache.get(process.env.LOG_DM_USER_ID)

    console.log(process.env.LOG_DM_USER_ID)
    client.users.fetch(process.env.LOG_DM_USER_ID).then((user) => {
        console.log(user);
        client.log_user = user
    }).catch(console.error);

    //client.log_user = client.users.get(process.env.LOG_DM_USER_ID)
}