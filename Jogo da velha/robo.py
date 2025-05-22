import socket 
import random

##Lógica python para criação e seleção das palavras 
animal = [['c', 'o', 'a', 'l', 'a'], ['r', 'a', 'p', 'o', 's', 'a'], ['i', 'g', 'u', 'a', 'n', 'a']]
comida = [['p', 'i', 'p', 'o', 'c', 'a'], ['c', 'a', 'v', 'i', 'a', 'r'], ['m', 'o', 's', 't', 'a', 'r', 'd', 'a']]
pais = [['c', 'a', 'n', 'a', 'd', 'á'], ['h', 'u', 'n', 'g', 'r', 'i', 'a'], ['b', 'a', 'h', 'a', 'm', 'a', 's']]

servidor = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
servidor.bind(('127.0.0.1', 9999))
while True:
    data, address = servidor.recvfrom(1024)
    
    #Selecionar a palavra 
    usuarioEscolheu = 1 #aqui vai ficar armazenado que tema o usuário escolheu que acho que tem que ser em tcp
    if (usuarioEscolheu == 1):
        palavraRodada = random.choice(animal)
    elif (usuarioEscolheu == 2):
        palavraRodada = random.choice(comida)
    else:
        palavraRodada = random.choice(pais)

    servidor.sendto("Olá cliente".encode(), address)