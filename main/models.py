from django.db import models


class Beacon(models.Model):
    beacon_id = models.CharField(max_length=100)
    beacon_name = models.CharField(max_length=100)
    x_position = models.IntegerField(default=0)
    y_position = models.IntegerField(default=0)

