from django.contrib import admin
from ..models.musica_atual import MusicaAtual

class MusicaAtualAdmin(admin.ModelAdmin):
    pass

admin.site.register(MusicaAtual, MusicaAtualAdmin)