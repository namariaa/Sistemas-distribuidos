from django.urls import path, include
from .musica import musica_router

urlpatterns = [
    path("", include(musica_router.urls)),
]