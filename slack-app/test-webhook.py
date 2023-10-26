from http.server import BaseHTTPRequestHandler, HTTPServer

class RequestHandler(BaseHTTPRequestHandler):

    def do_POST(self):
        # Get the data length and read the data
        data_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(data_length).decode('utf-8')

        # Log the data to console
        print(post_data)

        # Log the data to a file
        with open('payload.log', 'a') as file:
            file.write(post_data + '\n')

        # Send a 200 OK response
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Received")

def run():
    server_address = ('0.0.0.0', 3033)
    httpd = HTTPServer(server_address, RequestHandler)
    print('Starting server...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
