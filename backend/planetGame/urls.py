from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='home'),
    path('signup/', views.signUp, name='signup'),
    path('login/', views.login_game, name='login'),
    path('save_words/', views.save_words, name='save_words'),
    path('get_words/', views.get_words, name='get_words'),
    path('delete_word/', views.delete_word, name='delete_word'),
    path('play/<int:lesson_number>/', views.lets_play, name='play')
]