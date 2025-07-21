from rest_framework import serializers
from ..models.musica import Musica


class MusicaReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Musica
        fields = ["id", "nome", "link", "autor"]
        # Mesma coisa de fields = "__all__"
