import socket, time

cliente = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
cliente_tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
cliente_tcp.connect(('127.0.0.1',9998))
cliente_tcp.send("Pegar tema".encode())
print(cliente_tcp.recv(1024).decode())
tema = input("Tema: ").strip().lower()
cliente_tcp.send(tema.encode())
cliente.sendto("Iniciar".encode(), ('127.0.0.1',9999))

while True:
    data, _ = cliente.recvfrom(1024)
    mensagem = data.decode()
    print(mensagem)
    letra = input("Letra: ").strip().lower()
    cliente.sendto(letra.encode(), ('127.0.0.1',9999))#o servidor não local é ('10.25.2.154', 9999)



