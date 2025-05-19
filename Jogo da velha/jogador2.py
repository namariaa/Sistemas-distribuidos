import socket 

servidor = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
servidor.bind(('127.0.0.1', 9999))
while True:
    data, address = servidor.recvfrom(1024)
    print(data.decode())
    servidor.sendto("Olá cliente".encode(), address)