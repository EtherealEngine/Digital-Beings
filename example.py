import zerorpc
PORT = 42422

def handleMessage(sender, message):
    print("Handle messages to respond to here!");
    return "Respond to message from " + sender + " | " + message

class PythonServer(object):
    def listen(self):
        print("Listning on"+str(PORT))
    def message(self, sender, message):
        return handleMessage(sender, message)

try:
    s = zerorpc.Server(PythonServer())
    s.bind(f'tcp://0.0.0.0:{PORT}')
    s.run()
    print('PythonServer running...')
except Exception as e:
    print('unable to start PythonServer:', e)
    raise e
