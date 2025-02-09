from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.urls import reverse
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from .models import User, Word
from .serializers import WordsSerializer
import requests
import logging
import json

def main(request):
    return render(request, "planetGame/main.html", {'isLoggedIn': request.user.is_authenticated})

def signUp(request):
    if request.method == 'GET':
        return render(request, "planetGame/signup.html")
    
    if request.method == 'POST':
        name = request.POST.get('name')
        username = request.POST.get('username')
        password = request.POST.get('password')
        conf_password = request.POST.get('confirmation_password')
        recaptcha_response = request.POST.get('g-recaptcha-response')

        # Verify reCaptcha
        secret_key = "6LdEAM8qAAAAAO9kMBWow007cZOnyzBgeH0kmcx5"
        data = {
            "secret": secret_key,
            "response": recaptcha_response
        }
        recaptcha_verify_url = "https://www.google.com/recaptcha/api/siteverify"
        response = requests.post(recaptcha_verify_url, data=data)
        result = response.json()

        if not result.get("success"):
            return HttpResponse("reCAPTCHA verification failed! Please try again.")


        if not name or not username or not password or not conf_password:
            return HttpResponse("All fields are required!")

        if password != conf_password:
            return HttpResponse("Password and Confirmation password must be the same")
        
        if User.objects.filter(username=username).exists():
            return HttpResponse("Eee, username olishga kech qolgan ekansiz!")

        user = User.objects.create(first_name=name, username=username)
        user.set_password(password)
        user.save()

        return redirect(reverse('login'))
    
    else:
        return HttpResponse("There is no such method")
    
def login_game(request):
    if request.method == 'GET':
        return render(request, "planetGame/login.html")
    
    elif request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        recaptcha_response = request.POST.get('g-recaptcha-response')

        # Verify reCaptcha
        secret_key = "6LdEAM8qAAAAAO9kMBWow007cZOnyzBgeH0kmcx5"
        data = {
            "secret": secret_key,
            "response": recaptcha_response
        }
        recaptcha_verify_url = "https://www.google.com/recaptcha/api/siteverify"
        response = requests.post(recaptcha_verify_url, data=data)
        result = response.json()

        if not result.get("success"):
            return HttpResponse("reCAPTCHA verification failed! Please try again.")

        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)

            return redirect(reverse('home'))
        
        else:
            return HttpResponse('Incorrect credentials!')
        
@login_required
def save_words(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"message": 'Invalid Response'}, status=400)


        user = request.user
        lesson = data.get('lessonNumber')
        words = data.get('words')

        if not user or not lesson or not words:
            return JsonResponse({"message": "Not every input has been given"}, status=400)
        
        if len(words) > 5000:
            return JsonResponse({"message": "Too much data"}, status=400)
        
        words = parse_definitions(words)

        for word, definition in words.items():
            Word.objects.create(student=user, word=word, lesson=lesson, definition=definition)

        return JsonResponse({"message": "success!"}, status=200)
    
    else:
        return HttpResponse("Wrong endpoint", status=403)
    
logger = logging.getLogger(__name__)

def parse_definitions(input_string):
    word_dict = {}
    lines = input_string.split("\n")  
    current_word = None
    definition_lines = []

    for line in lines:
        try: 
            if not line.strip():
                continue

            # If the line starts a new word-definition pair
            if line.strip()[0].isdigit() and ':' in line:
                if current_word:
                    word_dict[current_word.strip()] = " ".join(definition_lines).strip()

                current_word, first_definition = line.split(":", 1)
                
                # if the first char is digit or . or ) skip them
                if current_word[1] == '.' or current_word[1] == ')' or current_word[1] == ',':
                    current_word = current_word[2:]

                definition_lines = [first_definition.strip()]  
            else:
                definition_lines.append(line.strip())
        except Exception as e:
            logger.error(f"Error processing line: {line}. Error: {str(e)}")
            continue

    if current_word:
        word_dict[current_word.strip()] = " ".join(definition_lines).strip()

    return word_dict

@login_required
def get_words(request):
    if request.method == 'GET':
        user = request.user

        words = Word.objects.filter(student=user).order_by('lesson')
        total_lessons = words[len(words) - 1].lesson
        words = WordsSerializer(words, many=True).data

        return JsonResponse({"message": "success", "words": words, "total_lessons": total_lessons}, status=200)
    if request.method == 'POST':
        user = request.user

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"message": 'Invalid Response'}, status=400)
        
        lessonNumber = data.get('lessonNumber')
        words = Word.objects.filter(student=user, lesson=lessonNumber).order_by('lesson')
        total_words = len(words)

        words = WordsSerializer(words, many=True).data

        return JsonResponse({"message": "success", "words": words,  "total_lessons": total_words}, status=200)

    else:
        return JsonResponse({"message": "Wrong endpoint"}, status=400)
    
@login_required
def delete_word(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"message": 'Invalid Response'}, status=400)
        
        Word.objects.filter(id=data, student=request.user).delete()

        return JsonResponse({"message": "succes"}, status=200)


@login_required
def lets_play(request, lesson_number):
    return render(request, 'planetGame/play.html')

