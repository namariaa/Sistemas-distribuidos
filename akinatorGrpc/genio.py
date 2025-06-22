from concurrent import futures
import grpc
import genio_pb2, genio_pb2_grpc
import akinator

class GenioService(genio_pb2_grpc.GenioService): #Criamos uma classe a aprtir da base feita no proto
    def chamaAPI(self, request, context): #Implementamos o método definido no serviço do .proto
        aki = akinator.Akinator()
        aki.start_game(language='pt')
        yield genio_pb2.Resposta(mensagem=aki.question) #Manda primeira pergunta sem encerrar sessão
        
        while not aki.finished:
            user_input = request.nome.strip().lower()
            if user_input == "v":
                try:
                    aki.back()
                except akinator.CantGoBackAnyFurther:
                    print("Você não pode voltar atrás!")
            else:
                try:
                    if (user_input == 's'):
                        user_input = 'y'
                    elif (user_input == 'sla'):
                        user_input = 'i'
                    aki.answer(user_input)

                    if aki.finished: #Se terminou
                        aki.win()
                        primeiro_chute = aki.first_guess
                        yield genio_pb2.Resposta(
                            fim_jogo=True,
                            mensagem="Fim de jogo!",
                            personagem=primeiro_chute['name'],
                            descricao=primeiro_chute['description'],
                            foto=primeiro_chute['absolute_picture_path']
                        )
                        return

                    yield genio_pb2.GenioReply(mensagem=aki.question) #O objeto retornado deve ser do tipo GenioReply

                except akinator.InvalidChoiceError:
                    print("Resposta inválida. Tente novamente.")
                
        print("\n--- Fim de jogo ---")
        print(f"Chute: {aki.name_proposition}")
        print(f"Descrição: {aki.description_proposition}")
        print(f"Pseudo: {aki.pseudo}")
        print(f"Foto: {aki.photo}")
        print(f"O gênio diz: {aki.question}")
        
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10)) #Cria servidor. Tem worker = 10 para lidar com chamadas concorrentes
    genio_pb2_grpc.add_GenioServiceServicer_to_server(GenioService(), server) 
    server.add_insecure_port('[::]:50051') #Confgurando porta 
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()