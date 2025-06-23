from concurrent import futures
import grpc
import genio_pb2, genio_pb2_grpc
import akinator
from akinator.exceptions import CantGoBackAnyFurther, InvalidThemeError  

class GenioService(genio_pb2_grpc.GenioServiceServicer):
    def chamaAPI(self, request_iterator, context):
        aki = akinator.Akinator()
        aki.start_game(language='pt')
        respostas_validas = ['s', 'n', 'sla', 'p', 'pn', 'v']
        yield genio_pb2.GenioReply(mensagem=aki.question, fim_jogo=False)
        
        for request in request_iterator:
            user_input = request.resposta.strip().lower()
            
            if user_input not in respostas_validas:
                yield genio_pb2.GenioReply(
                    mensagem="Resposta inválida! Use apenas: s, n, sla, p, pn, v",
                    fim_jogo=False
                )
                continue

            try:
                if user_input == "v":
                    try:
                        aki.back()
                    except CantGoBackAnyFurther:
                        yield genio_pb2.GenioReply(
                            mensagem="Você não pode voltar mais!",
                            fim_jogo=False
                        )
                    else:
                        yield genio_pb2.GenioReply(
                            mensagem=aki.question,
                            fim_jogo=False
                        )
                else:
                    if user_input == 's':
                        user_input = 'y'
                    elif user_input == 'sla':
                        user_input = 'i'
                    
                    aki.answer(user_input)
                    
                    if aki.finished:
                        yield genio_pb2.GenioReply(
                                mensagem="Fim de jogo!",
                                fim_jogo=True,
                                personagem=aki.name_proposition,
                                descricao=aki.description_proposition,
                                foto=aki.photo
                            )
                        return
                    else:
                        yield genio_pb2.GenioReply(
                            mensagem=aki.question,
                            fim_jogo=False
                        )
            
            
            except InvalidThemeError:
                yield genio_pb2.GenioReply(
                    mensagem="Resposta inválida. Tente novamente.",
                    fim_jogo=False
                )
            except Exception as e:
                print(f"Erro interno: {str(e)}")
                import traceback
                traceback.print_exc()
                yield genio_pb2.GenioReply(
                    mensagem=f"Erro interno: {str(e)}",
                    fim_jogo=True
                )
                return

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    genio_pb2_grpc.add_GenioServiceServicer_to_server(GenioService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()