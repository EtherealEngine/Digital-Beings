class envLoader:
    def __init__(self):
        self.env_vars = []
        with open('.env') as f:
            for line in f:
                if line.startswith('#') or not line.strip():
                    continue
                key, value = line.strip().split('=', 1)
                self.env_vars.append({'name': key, 'value': value}) 
    
    def getDict(self):
        return self.env_vars
    
    def getValue(self, key):
        for value in self.env_vars:
            if (value['name'] == key):
                return value['value']

        return ''