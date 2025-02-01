from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxLengthValidator
from django.db import models

class User(AbstractUser):
    pass

    def __str__(self):
        return f"{self.username}"

class Word(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='words')
    lesson = models.IntegerField()
    word = models.CharField(max_length=100)
    definition = models.TextField(blank=True, null=True, validators=[MaxLengthValidator(500)])

    def __str__(self):
        return self.word
    
    


