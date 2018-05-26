from django.shortcuts import render, redirect, HttpResponse
import os
import time, picamera
import cv2
from django.conf import settings


def index(request):
    context = {}
    template_name = ''
    if request.method == 'GET':
        template_name = 'index.html'

    if request.method == 'POST':
        # Open camera
        openCamera()
        
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
        patientID = request.POST.get('patientID')
        remainSeconds = request.POST.get('remainSeconds')
        if request.POST.get('type') == 'init':
            left = request.POST.get('left')
            top = request.POST.get('top')
            camera = settings.CAMERA
            camera.resolution = (640, 480)
            camera.start_preview(fullscreen=False, window=(int(left), int(top), 450, 300))
            return HttpResponse()
        
        elif request.POST.get('type') == 'check':
            # Taking a picture and analysis it
            camera = settings.CAMERA
            fileName = patientID + '_' + remainSeconds + '_' + str(int(time.time()))
            filePath = '/home/pi/Documents/smartTerminalPi/resources/check/' + fileName + '.jpg'
            checkFile = open(filePath, 'wb')
            camera.capture(checkFile, resize=(300, 300))
            checkFile.close()
            
            # Analysis the position using this image, if it is OK, send fileName
            
            return HttpResponse(fileName)
        
        elif request.POST.get('type') == 'test':
            fileName = request.POST.get('fileName')
            # Recording video
            camera = settings.CAMERA
            filePath = '/home/pi/Documents/smartTerminalPi/resources/test/' + fileName + '.h264'
            testFile = open(filePath, 'wb')
            camera.start_recording(testFile)
            time.sleep(5)
            # time.sleep(int(remainSeconds) * 60)
            camera.stop_recording()
            testFile.close()
            return HttpResponse(fileName)

        elif request.POST.get('type') == 'upload':
            fileName = request.POST.get('fileName')
            filePath = '/home/pi/Documents/smartTerminalPi/resources/test/' + fileName + '.h264'
            # Transfer video to images
            vc = cv2.VideoCapture(filePath)
            c = 1
            if vc.isOpened():
                rval, frame = vc.read()
            else:
                rval = False
                
            imagePath = '/home/pi/Documents/smartTerminalPi/resources/test/' + fileName
            mkdir(imagePath)
            while rval:
                rval, frame = vc.read()
                cv2.imwrite(imagePath + '/image' + str(c) + '.jpg', frame)
                c = c + 1
                cv2.waitKey(1)
                
            vc.release()
            
            # Delete video and zip images
            os.remove(filePath)
            
            # Upload to AWS
            
            # Close camera

            return HttpResponse('success')
        
        else:
            camera = settings.CAMERA
            camera.close()
            file = open('/home/pi/Documents/smartTerminalPi/smartTerminalPi/smartTerminal/single.txt', 'w')
            file.write('False')
            file.close()
            return redirect('index')
        
        
def openCamera():
    file = open('/home/pi/Documents/smartTerminalPi/smartTerminalPi/smartTerminal/single.txt', 'r')
    data = file.readlines()
    file.close()
    if len(data) > 0 and data[0] == 'False':
        settings.CAMERA = picamera.PiCamera()
        file = open('/home/pi/Documents/smartTerminalPi/smartTerminalPi/smartTerminal/single.txt', 'w')
        file.write('True')
        file.close()
    
    
def mkdir(path):
    isExists = os.path.exists(path)
    if isExists:
        os.removedirs(path)
    
    os.makedirs(path)
    return True