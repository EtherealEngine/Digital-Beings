import re

def getUrls(text):
    urls = re.findall('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text)
    return urls

def readHtmlFromUrl(url):
    import urllib.request
    response = urllib.request.urlopen(url)
    html = response.read().decode('utf-8')
    return html

def readMetaFromHtml(html):
    meta = re.findall('<meta.*?>', html)
    return meta

def getMetadataFromText(text):
    urls = getUrls(text)
    meta = []
    try:
        for url in urls:
            html = readHtmlFromUrl(url)
            meta += readMetaFromHtml(html)
    except Exception as e:
        print(e)
    
    return meta
