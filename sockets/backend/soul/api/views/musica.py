import os
import re
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
        random_music = Musica.objects.order_by("-id").first()

        yt = YouTube(random_music.link)
        ys = yt.streams.get_audio_only()

        # Cria um diretório temporário seguro para Windows
        temp_dir = os.path.join(os.getenv("TEMP"), "youtube_downloads")
        os.makedirs(temp_dir, exist_ok=True)

        # Remove caracteres inválidos do nome do arquivo
        safe_title = re.sub(r'[<>:"/\\|?*]', "", yt.title)
        safe_title = safe_title[:100]  # Limita o tamanho do nome do arquivo

        temp_file_path = os.path.join(temp_dir, f"{safe_title}.mp4")

        # Baixa o arquivo
        ys.download(output_path=temp_dir, filename=f"{safe_title}.mp4")

        # Prepara a resposta
        file = open(temp_file_path, "rb")
        response = FileResponse(file)

        # Configura os headers
        response["Content-Disposition"] = f'attachment; filename="{safe_title}.mp4"'
        response["Content-Type"] = "audio/mp4"
        response["nome_musica"] = random_music.nome
        response["nome_autor"] = random_music.autor
        response["Access-Control-Expose-Headers"] = "nome_autor, nome_musica"

        # Configura para deletar o arquivo após o envio
        def cleanup():
            try:
                file.close()
                os.unlink(temp_file_path)
            except:
                pass

        response.closed = cleanup

        return response
