from django.db import models
from django.contrib.postgres.fields import JSONField


# Create your models here.

class Game(models.Model):
	game_id = models.TextField(max_length=30)
	size = models.IntegerField(default=10)
	row = models.IntegerField(default=0)
	col = models.IntegerField(default=0)
	initial_pressure = models.IntegerField(default=60)
	grid = JSONField()
	pressure = JSONField(default=None)
