import grpc
import sample_pb2

channel = grpc.insecure_channel('localhost:50051')
stub = sample_pb2.SearchServiceStub(channel)

req = sample_pb2.TestRequest(data='test123')
print stub.Search(req)

print("Hello")

def get_bot_response(message):
    print("Hello world!")
    # url = "http://127.0.0.1:8000/api/ask-question/"

    # payload = "id={}&question={}".format(bot_id, message)
    # print("payload ==> ", payload)
    # headers = {
    #     'content-type': "application/x-www-form-urlencoded",
    #     'cache-control': "no-cache",
    #     'Accept': "application/json"
    #     }

    # response = requests.request("POST", url, data=payload, headers=headers)
    # return response.text