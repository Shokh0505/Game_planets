from rest_framework import serializers
from .models import Word

class WordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ['id', 'lesson', 'word', 'definition']
