from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from main.models import Beacon
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt
import json

def home(request):
    return render(request, 'index.html')


def add_new_beacon(request):
    if request.method == 'POST' and request.is_ajax():
        beacon_id = request.POST.get('beacon_id')
        beacon_name = request.POST.get('beacon_name')
        x_position = request.POST.get('x_position')
        y_position = request.POST.get('y_position')
        beacon = Beacon(
            beacon_id=beacon_id,
            beacon_name=beacon_name,
            x_position=x_position,
            y_position=y_position
        )
        beacon.save()

        response_data = {
            "beacon_id": beacon_id,
            "beacon_name": beacon_name
        }

        return JsonResponse(response_data)


def bulk_create_beacons(request):
    if request.method == 'POST' and request.is_ajax():
        beacon_list = []
        resp = {"beacons":[],"status":""}
        print(request.body)

        body_unicode = request.body.decode('utf-8')
        beacons = json.loads(body_unicode)['beacons']
        for b in beacons:
            data = {
                "beacon_id":b['beacon_id'],
                "beacon_name":b['beacon_name'],
                "x_position":b['x_position'],
                "y_position":b['y_position']
            }
            beacon_list.append(Beacon(
                beacon_id=b['beacon_id'],
                beacon_name=b['beacon_name'],
                x_position=b['x_position'],
                y_position=b['y_position']
            ))
            resp["beacons"].append(data)
        Beacon.objects.bulk_create(beacon_list)
        resp["status"] = "success"
        return HttpResponse(
            json.dumps(resp),
            content_type='application/json'
        )
