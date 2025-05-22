import socket 
import random

# Palavras por categoria
animal = [['c', 'o', 'a', 'l', 'a'], ['r', 'a', 'p', 'o', 's', 'a'], ['i', 'g', 'u', 'a', 'n', 'a']]
comida = [['p', 'i', 'p', 'o', 'c', 'a'], ['c', 'a', 'v', 'i', 'a', 'r'], ['m', 'o', 's', 't', 'a', 'r', 'd', 'a']]
pais = [['c', 'a', 'n', 'a', 'd', 'á'], ['h', 'u', 'n', 'g', 'r', 'i', 'a'], ['b', 'a', 'h', 'a', 'm', 'a', 's']]

# Iniciar socket
servidor = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
servidor.bind(('127.0.0.1', 9999))
servidor_tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
servidor_tcp.bind(('127.0.0.1', 9998))
servidor_tcp.listen(1)
conn, addr = servidor_tcp.accept()
grupos = " ".join("Escolha um tema: \n[1] Animal \n[2]Comida \n[3]País")
conn.send(f"Escolha um grupo de palavras \n{grupos}: ".encode())
grupo = conn.recv(1024).decode()
print(grupo)

print("Aguardando quem ousa me desafiar...")

while True:
    # Espera o cliente enviar "iniciar"
    data, address = servidor.recvfrom(1024)

    # Define o tema fixo por enquanto
    usuarioEscolheu = grupo
    if usuarioEscolheu == 1:
        palavraRodada = random.choice(animal)
    elif usuarioEscolheu == 2:
        palavraRodada = random.choice(comida)
    else:
        palavraRodada = random.choice(pais)

    letrasChutadas = []
    letrasAcertadas = []
    chances = 6
    under = ""
    for i in palavraRodada:
        under += "* "
    servidor.sendto(f"{under}".encode(), address)
    while True:
        letraData, _ = servidor.recvfrom(1024)
        letra = letraData.decode().strip().lower()

        if letra not in palavraRodada:
            chances -= 1
            mostrarLetra = ""
            for i in palavraRodada:
                if i in letrasAcertadas:
                    mostrarLetra += i + " "
            servidor.sendto(f"Errou! \n{mostrarLetra}".encode(), address)
        else:
            letrasAcertadas.append(letra)
            mostrarLetra = ""
            certos = 0
            for i in palavraRodada:
                if i in letrasAcertadas:
                    mostrarLetra += i + " "
                    certos += 1
            if certos == len(palavraRodada):
                break
            servidor.sendto(f"Acetou! \n{mostrarLetra}".encode(), address)
        

        if letra in letrasChutadas:
            servidor.sendto("Letra repetida, melhor tentar outra".encode(), address)
            continue

        letrasChutadas.append(letra)

        if chances == 0:
            break
        if len(palavraRodada) == len(letrasAcertadas):
            break
    
    if (chances != 0):
        servidor.sendto("Deu certo você acertou e ganhou".encode(), address)
        servidor.close()
        
