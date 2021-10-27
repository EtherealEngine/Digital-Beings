def read_file(filename):
    filename = 'bot_manager/' + filename
    print(filename)
    with open(filename, 'r') as infile:
        text = infile.read()
    return text

def getAgeGroup(age):
    if age == 12:
        return '1-12'
    elif age == 16:
        return '12-16'
    else:
        return '16+'