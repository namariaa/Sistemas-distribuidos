import socket

# TCP para pegar nome e link

servidor = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
servidor.bind(("127.0.0.1", 9999))
servidor.listen(2)

while True:
    ouvinte, address = servidor.accept()
    print(ouvinte.recv(1024).decode())
