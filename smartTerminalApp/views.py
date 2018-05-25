from django.shortcuts import render, redirect


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
            context['patientID'] = patient_id
            context['interval'] = interval
            context['time'] = time
            return redirect('main', params=patient_id + ',' + interval + ',' + time)
        else:
            context['message'] = 'Patient ID does not exist!'
            template_name = 'index.html'

    return render(request, template_name, context)


def main(request, params):
    context = {}
    if request.method == 'GET':
        patient_id = params.split(',')[0]
        interval = params.split(',')[1]
        time = params.split(',')[2]
        context['patientID'] = patient_id
        context['interval'] = interval
        context['time'] = time
        if len(time) < 2:
            show_time = '0' + time
        else:
            show_time = time

        context['show_time'] = show_time + ':00'

    if request.method == 'POST':
        context['patientID'] = ""

    return render(request, 'main.html', context)
