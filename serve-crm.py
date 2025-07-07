#!/usr/bin/env python3
import http.server
import socketserver
import os

# Change to the directory containing the HTML file
os.chdir('/workspaces/SG-CRM-V1')

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving CRM at http://localhost:{PORT}/simple-crm.html")
    print(f"Press Ctrl+C to stop the server")
    httpd.serve_forever()
