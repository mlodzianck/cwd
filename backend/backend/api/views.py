from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import  MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from backend.api.fr import analyze
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os

from backend.openai_serv import get_chat_answer

@api_view()
def hello_world(request):
    return Response({"message": "Hello, world!"})



def process_content(request,doc_content):
    request.session['doc_content']=doc_content
    request.session['chat_messages']=[]

    type_of_doc_answer = get_chat_answer("Jaki jest to typ dokumentu? Odpowiedz jedynie nazwą dokumentu",doc_content)
    sample_questions = get_chat_answer("Wygeneruj 2 przykładowe pytania na które będziesz w stanie odpowiedzieć na podstawie dokumentu",doc_content)
    if type_of_doc_answer['status']!='no_answer':
        request.session['type_of_doc']=type_of_doc_answer['answer']
        request.session['chat_messages'].append({
            "message": "Dokument który został przesłany to: "+request.session['type_of_doc'], "direction":"assistant"
        })
    else:
        request.session['type_of_doc']="Nieznany dokument"
        request.session['chat_messages'].append({
            "message": "Nie jestem w stanie określić typu dokumetu", "direction":"assistant"
        })
    if sample_questions['status']!='no_answer':
        request.session['chat_messages'].append({
            "message": "Możesz zadawać pytania odnośnie dokumentu, na przykład: "+sample_questions['answer'], "direction":"assistant"
        })
        
    
    
    return Response(status=status.HTTP_200_OK)



@api_view(['GET'])
def process_sample(request):
    file_path  = os.path.join("static/", request.GET.get("sampleName"))
    doc_content = analyze(file_path)
    return process_content(request,doc_content)




@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_file(request):
    request.session['type_of_doc'] = ""
    if 'file' not in request.data:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
    file_obj = request.data['file']
    path = default_storage.save('tmp/'+file_obj.name, ContentFile(file_obj.read()))
    tmp_file = os.path.join(settings.MEDIA_ROOT, path)
    doc_content = analyze(tmp_file)
    os.remove(tmp_file)
    return process_content(request,doc_content)

@api_view()    
def get_doc_type(request):
   return Response({"type_of_doc":request.session['type_of_doc']})

@api_view()    
def is_active(request):
   is_active = "chat_messages" in request.session
   if is_active:
       is_active = is_active and len(request.session['chat_messages'])>0
   return Response({"is_active":is_active})


@api_view()    
def get_all_messages(request):
   return Response({"messages":request.session['chat_messages']})


@api_view(['POST'])
def ask(request):
    chat_messages = request.session['chat_messages']
    question = request.data['question']
    chat_messages.append({
            "message": question, "direction":"human"
    })

    doc_content = request.session['doc_content']
    answer = get_chat_answer(question,doc_content,chat_messages)
    unwrapped_anwer = ""
    if answer['status']=="no_answer":
        unwrapped_anwer = "Nie można udzielić odpowiedzi na to pytanie na podstawie dokumentu"
    else:
       unwrapped_anwer =answer['answer']

    chat_messages.append({
            "message": unwrapped_anwer, "direction":"assistant"
    })
    request.session['chat_messages'] = chat_messages


    
    return Response({"message": unwrapped_anwer})


from django.shortcuts import render

def index(request):
  return render(request, "api/index.html")