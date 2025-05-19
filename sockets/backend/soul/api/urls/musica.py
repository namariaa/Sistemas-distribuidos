from rest_framework import routers
from api.views.musica import MusicaViewSet

musica_router = routers.DefaultRouter()
musica_router.register('musica', MusicaViewSet, basename='musica')
