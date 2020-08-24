from django.urls import path

from . import views

app_name = 'sim'
urlpatterns = [ 
	path('tutorials',views.tutorials, name='tutorials'),
	path('log',views.log, name = 'log'),
	path('log/<str:id>/', views.logfile, name='logfile')
]