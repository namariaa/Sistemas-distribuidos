from django.db import models


class Musica(models.Model):
    nome = models.CharField(max_length=255)
    link = models.URLField(max_length=255)
    autor = models.CharField(max_length=255)
    
    def __str__(self):
        return self.nome

    