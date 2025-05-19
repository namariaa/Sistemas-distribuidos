import socket

cliente = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
cliente.sendto("Ola servidor".encode(), ('127.0.0.1', 9999))
data, address = cliente.recvfrom(1024)
print(data.decode())