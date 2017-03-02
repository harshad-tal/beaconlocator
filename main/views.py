from django.shortcuts import render
from django.http import JsonResponse
# from main.forms import BeaconForm
from main.models import Beacon

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
