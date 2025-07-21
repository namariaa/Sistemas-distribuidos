import os
import base64
from django.http import FileResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from ..models import Musica
from ..models import MusicaAtual
from rest_framework import status
from rest_framework.response import Response
from pytubefix import YouTube
from pytubefix.cli import on_progress
from datetime import date
from rest_framework.decorators import api_view


class MusicaViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for viewing and editing musicas.
    """

    # queryset = Musica.objects.all()
    # serializer_class = MusicaReadSerializer
    # permission_classes = [] para caso tiver papel

    @api_view(['POST'])
    def create_from_soap(request):
        try:
            musica = Musica.objects.create(
                nome=request.data.get('nome'),
                autor=request.data.get('autor'),
                link=request.data.get('link')
            )
            return Response({'status': 'success', 'id': musica.id})
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=400)
        
    @action(
        detail=False, methods=["get"]
    )  # Para criar métodos já que estou usando ModelViewSet que já é pronto
    # Detail True é para usar o id no end False tira
    def download(
        self, request, pk=None
    ):  # Baixa para enviar o arquivo do audio como retorno da API
        hoje = date.today()
        musica_atual = MusicaAtual.objects.filter(data_atual=hoje).first()
        if not musica_atual:
            random_music = Musica.objects.order_by("?")[0]
            MusicaAtual.objects.create(musica=random_music)
        else:
            random_music = musica_atual.musica


        yt = YouTube(random_music.link, on_progress_callback=on_progress)
        ys = yt.streams.get_audio_only()
        temp_file_path = os.path.join("/tmp", f"{yt.title}.mp4")
        ys.download(output_path="/tmp", filename=f"{yt.title}.mp4")
        file = open(temp_file_path, "rb")
        response = FileResponse(file)
        response["Content-Disposition"] = f'attachment; filename="{yt.title}.mp4"'
        response["Content-Type"] = "audio/mp4"
        response["nome_musica"] = random_music.nome
        response["nome_autor"] = random_music.autor
        response["Access-Control-Expose-Headers"] = "nome_autor, nome_musica"
        response["Delete-After-Send"] = "true"

        return response

    @action(detail=False, methods=["get"])
    def imagem(self, request):
        hoje = date.today()
        musica_atual = MusicaAtual.objects.filter(data_atual=hoje).first()

        if not musica_atual:
            return Response(
                {
                    "error": "Nenhuma música encontrada para hoje ou imagem não disponível"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        with open(musica_atual.musica.imagem.path, "rb") as img_file:
            imagem_base64 = base64.b64encode(img_file.read()).decode("utf-8")
            return Response({"imagem_base64": imagem_base64}, status=status.HTTP_200_OK)
