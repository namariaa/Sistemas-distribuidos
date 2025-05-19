from django.db import models
from .musica import Musica


class MusicaAtual(models.Model):
    musica = models.ForeignKey(Musica, on_delete=models.CASCADE)
    data_atual = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return self.musica.nome

    