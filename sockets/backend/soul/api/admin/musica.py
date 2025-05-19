from django.contrib import admin
from ..models.musica import Musica

class MusicaAdmin(admin.ModelAdmin):
    pass

admin.site.register(Musica, MusicaAdmin)