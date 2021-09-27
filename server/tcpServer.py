import socket

class tcpServer:
    def __init__(self, host, port):
        self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._socket.bind((host, port))
        print('listening')
        self._socket.listen(1)

        self.conn = self._socket.accept()[0]
        print('client connected')
    
    def sendMessage(self, text: str):
        print(text)
        if (self.conn != None):
            try:
                self.conn.send(str(text).encode())
            except Exception as err:
                print('tcpServer sendMessage: ' + err)