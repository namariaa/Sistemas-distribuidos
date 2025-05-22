import socket, time

cliente = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
cliente_tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
cliente_tcp.connect(('10.25.2.154',9998))
print(cliente_tcp.recv(1024).decode())
tema = input("Digite o número do tema (1-3): ").strip()
cliente_tcp.send(tema.encode())
cliente.sendto("Iniciar".encode(), ('10.25.2.154',9999))

while True:
    data, _ = cliente.recvfrom(1024)
    mensagem = data.decode()
    print(mensagem)
    letra = input("Letra: ").strip().lower()
    cliente.sendto(letra.encode(), ('10.25.2.154',9999))#o servidor não local é ('10.25.2.154', 9999)



#Ip do cliente: 10.25.3.194
#ip servidor 10.25.2.154