from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^home/', views.home),
    url(r'^add_beacon/', views.add_new_beacon),
]
