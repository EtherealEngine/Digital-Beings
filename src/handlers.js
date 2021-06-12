function getHandlers(bot) {
    return service = {
        test(call, callback) {
            console.log(call.request);

            const res = {
                response: `Responding to your request containing ${call.request.data}!`
            };

            callback(null, res);
        }
    };
}
exports = getHandlers;
