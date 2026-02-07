"""Dev server with Range request support (needed for <video> elements)."""
import http.server
import os

class RangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.isfile(path):
            return super().send_head()

        range_header = self.headers.get('Range')
        if range_header is None:
            return super().send_head()

        # Parse Range header
        try:
            range_spec = range_header.strip().split('=')[1]
            start_str, end_str = range_spec.split('-')
            file_size = os.path.getsize(path)
            start = int(start_str) if start_str else 0
            end = int(end_str) if end_str else file_size - 1
            end = min(end, file_size - 1)
            content_length = end - start + 1
        except (ValueError, IndexError):
            return super().send_head()

        ctype = self.guess_type(path)
        f = open(path, 'rb')
        f.seek(start)

        self.send_response(206)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
        self.send_header('Content-Length', str(content_length))
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()
        return f

if __name__ == '__main__':
    PORT = 8081
    os.chdir(os.path.join(os.path.dirname(__file__), '..'))
    with http.server.HTTPServer(('', PORT), RangeHTTPRequestHandler) as httpd:
        print(f'Serving on http://localhost:{PORT}')
        httpd.serve_forever()
