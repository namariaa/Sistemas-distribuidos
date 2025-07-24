import os
import base64
from django.http import FileResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from ..models import Musica
from ..models import MusicaAtual
from ..serializers.musica import MusicaReadSerializer
from rest_framework import status
from rest_framework.response import Response
from pytubefix import YouTube
from pytubefix.cli import on_progress
from datetime import date
from rest_framework.decorators import api_view


class MusicaViewSet(viewsets.ModelViewSet):
    queryset = Musica.objects.all()
    serializer_class = MusicaReadSerializer

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
