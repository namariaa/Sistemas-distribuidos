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
import tempfile


class MusicaViewSet(viewsets.ModelViewSet):
    queryset = Musica.objects.all()
    serializer_class = MusicaReadSerializer
    
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        try:
            musica = Musica.objects.get(id=pk)
            yt = YouTube(musica.link)
            ys = yt.streams.get_audio_only()
            
            temp_dir = os.path.join(tempfile.gettempdir(), "youtube_downloads")
            os.makedirs(temp_dir, exist_ok=True)
            os.chmod(temp_dir, 0o777) 

            # temp_dir = os.path.join(os.getenv("TEMP"), "youtube_downloads")
            # os.makedirs(temp_dir, exist_ok=True)
            safe_title = re.sub(r'[<>:"/\\|?*]', "", yt.title)
            safe_title = safe_title[:100]

            temp_file_path = os.path.join(temp_dir, f"{safe_title}.mp4")
            ys.download(output_path=temp_dir, filename=f"{safe_title}.mp4")
            
            file = open(temp_file_path, "rb")
            response = FileResponse(file)
            response["Content-Disposition"] = f'attachment; filename="{safe_title}.mp4"'
            response["Content-Type"] = "audio/mp4"
            response["nome_musica"] = musica.nome
            response["nome_autor"] = musica.autor
            response["Access-Control-Expose-Headers"] = "nome_autor, nome_musica"
            
            def cleanup():
                try:
                    file.close()
                    os.unlink(temp_file_path)
                except:
                    pass

            response.closed = cleanup
            return response
            
        except Musica.DoesNotExist:
            return Response({"error": "Música não encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
