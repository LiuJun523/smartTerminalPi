from django.shortcuts import render, redirect, HttpResponse
import json


def index(request):
    context = {}
    template_name = ''
    if request.method == 'GET':
        template_name = 'index.html'

    if request.method == 'POST':
        patient_id = request.POST.get('patientID')
        interval = request.POST.get('interval')
        time = request.POST.get('time')

        patient_id = patient_id.strip()
        if patient_id == 'P1':
            request.session['patientID'] = patient_id
            request.session['interval'] = interval
            request.session['time'] = time
            return redirect('main')
        else:
            context['message'] = 'Patient ID does not exist!'
            template_name = 'index.html'

    return render(request, template_name, context)


def main(request):
    context = {}
    if request.method == 'GET':
        patient_id = request.session.get('patientID', None)
        interval = request.session.get('interval', None)
        time = request.session.get('time', None)
        context['patientID'] = patient_id
        context['interval'] = interval
        context['time'] = time
        if len(time) < 2:
            show_time = '0' + time
        else:
            show_time = time
        context['show_time'] = show_time + ':00'

        return render(request, 'main.html', context)

    if request.method == 'POST':
        return HttpResponse('success')
