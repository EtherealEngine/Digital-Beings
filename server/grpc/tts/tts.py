from FifteenAPI import FifteenAPI

class tts:
    def __init__(self):
        self.api = FifteenAPI(show_debug=True)
    
    def textToVoice(self, text, fileName): 
        self.api.save_to_file("Fluttershi", "Neutral", text, fileName)