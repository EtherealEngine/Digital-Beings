import zerorpc
PORT = 42422

class PythonServer(object):
    def listen(self):
        print("Listning on"+str(PORT))
    def message(self, sender, message):
        return "Respond to message from " + sender + " | " + message

try:
    s = zerorpc.Server(PythonServer())
    s.bind(f'tcp://0.0.0.0:{PORT}')
    s.run()
    print('PythonServer running...')
except Exception as e:
    print('unable to start PythonServer:', e)
    raise e