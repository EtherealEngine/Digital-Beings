export async function handleGuildMemberAdd(messageResponseHandler, client, user) {
    const userId = user.user.id
    const username = user.user.username

    const args = {}
    args['grpc_args'] = {};

    args['parsed_words'] = 'user_join'
    args['command_info'] = [
        'user_update',
        [ 'HandleUserUpdate' ],
        [ 'username', 'event', 'createdAt' ],
        'handle user update'
      ]
    args['grpc_args']['username'] = username + ''
    if (args['command_info']) {
        args['command'] = args['command_info'][0];
        args['grpc_args']['username'] = username + ''
        args['grpc_args']['event'] = 'join'
        args['grpc_method'] = args['command_info'][1][0];
        args['grpc_method_params'] = args['command_info'][2];
    }

    const dateNow = new Date();
    var utc = new Date(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours(), dateNow.getUTCMinutes(), dateNow.getUTCSeconds());
    const utcStr = dateNow.getDate() + '/' + (dateNow.getMonth() + 1) + '/' + dateNow.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
    args['grpc_args']['createdAt'] = utcStr
    
    
    await messageResponseHandler(args, (response) => {
        console.log(JSON.stringify(response))
        Object.keys(response.response).map(function(key, index) {
        })
    })
};