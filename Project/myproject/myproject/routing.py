from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path
from sim import consumers
from django.conf.urls import url

websocket_urlpatterns = [
    url(r'ws/sim$', consumers.MyConsumer),
]

application = ProtocolTypeRouter({
    # http is channels.http.AsgiHandler by default 
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
