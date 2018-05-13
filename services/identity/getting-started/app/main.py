import falcon
import uuid

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
        # for testing in case the identity server stops
        if (len(self.dids) == self.count):
           self.dids.append(uuid.uuid4().hex[:22])
        response.media = self.dids[self.count-1]


app = falcon.API()
app.add_route('/', HelloWorldResource())
app.add_route('/dids', DIDS())
