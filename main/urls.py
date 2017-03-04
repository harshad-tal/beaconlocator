from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^home/', views.home),
    url(r'^add_beacon/', views.add_new_beacon),
    url(r'^get_beacons/', views.get_beacons),
    url(r'^bulk_create_beacons/', views.bulk_create_beacons),
]
