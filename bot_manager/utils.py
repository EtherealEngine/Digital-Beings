def read_file(filename):
    filename = 'bot_manager/' + filename
    print(filename)
    with open(filename, 'r') as infile:
        text = infile.read()
    return text

def getAgeGroup(age):
    age = str(age)
    if age == '12':
        return '1-12'
    elif age == '16':
        return '12-16'
    elif age == '18':
        return '16+'
    else:
        return 'XXX'