from django.shortcuts import render, redirect


def index(request):
    context = {}
    template_name = ''
    if request.method == 'GET':
        template_name = 'index.html'

    if request.method == 'POST':
        patient_id = request.POST.get('patientID')
        interval = request.POST.get('interval')

        patient_id = patient_id.strip()
        if patient_id == 'P1':
            context['patientID'] = patient_id
            context['interval'] = interval
            return redirect('main', params=patient_id + ',' + interval)
        else:
            context['message'] = 'Patient ID does not exist!'
            template_name = 'index.html'

    return render(request, template_name, context)


def main(request, params):
    context = {}
    if request.method == 'GET':
        patient_id = params.split(',')[0]
        interval = params.split(',')[1]
        context['patientID'] = patient_id
        context['interval'] = interval

    return render(request, 'main.html', context)