from django.shortcuts import render, redirect, HttpResponse
import time
import cv2


def index(request):
    context = {}
    template_name = ''
    if request.method == 'GET':
        template_name = 'index.html'

    if request.method == 'POST':
        patientID = request.POST.get('patientID')
        interval = request.POST.get('interval')
        remainSeconds = request.POST.get('remainSeconds')

        patientID = patientID.strip()
        if patientID == 'P1':
            request.session['patientID'] = patientID
            request.session['interval'] = interval
            request.session['remainSeconds'] = remainSeconds
            return redirect('main')
        else:
            context['message'] = 'Patient ID does not exist!'
            template_name = 'index.html'

    return render(request, template_name, context)


def main(request):
    context = {}
    if request.method == 'GET':
        patientID = request.session.get('patientID', None)
        interval = request.session.get('interval', None)
        remainSeconds = request.session.get('remainSeconds', None)
        context['patientID'] = patientID
        context['interval'] = interval
        context['remainSeconds'] = remainSeconds
        if len(remainSeconds) < 2:
            showTime = '0' + remainSeconds
        else:
            showTime = remainSeconds
        context['showTime'] = showTime + ':00'

        return render(request, 'main.html', context)

    if request.method == 'POST':
        patientid = request.POST.get('patientID')
        if request.POST.get('type') == 'check':
            left = request.POST.get('left')
            top = request.POST.get('top')
            filename = patientid + '_' + str(int(time.time())) + '.h264'

            return HttpResponse(filename)
