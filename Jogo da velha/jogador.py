import socket, time

cliente = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
while True:
    cliente.sendto("Ola servidor".encode(), ('10.25.2.154', 9999))
    data, address = cliente.recvfrom(1024)
    print(data.decode())

# servidor = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# servidor.bind(('10.25.3.194', 9999))
# servidor.settimeout(5.0)
# while True:
#     data, address = servidor.recvfrom(1024)
#     servidor.sendto("Olá Gaby".encode(), address)
#     print(f"Recebido de {address}: {data.decode()}")

#     time.sleep(1)



