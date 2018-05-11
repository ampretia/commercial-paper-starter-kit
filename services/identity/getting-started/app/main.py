import falcon

class HelloWorldResource:

    def on_get(self, request, response):

        response.media = ('Hello World from Falcon Python 3.6 app with' +
                          ' Gunicorn running in a container.')

class DIDS:



    def __init__(self):
        self.dids = []
        file = open("/tmp/data.csv") 
        ds = file.readlines() 
        self.count = 0
        for x in ds:
            self.dids.append(x.rstrip())
           

    def on_get(self, request, response):            
        response.media = self.dids[:self.count]

    def on_post(self,request,response):
        self.count+=1
        response.media = self.dids[self.count-1]



app = falcon.API()
app.add_route('/', HelloWorldResource())
app.add_route('/dids', DIDS())