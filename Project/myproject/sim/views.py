from django.http import HttpResponse, HttpResponseRedirect, Http404
import csv
from sim.models import Game, Log
import os
from datetime import date
from postgres_copy import CopyManager
from .forms import SearchForm
from django import forms
# Create your views here.

def logfile(request, id):
	# Create the HttpResponse object with the appropriate CSV header.
	file_path = './data_' + id + '.csv'
	logs = Log.objects.filter(sim_id=id)
	if logs:
		logs.to_csv(file_path)
	if os.path.exists(file_path):
		with open(file_path, 'rb') as fh:
			response = HttpResponse(fh.read(), content_type='text/csv')
			response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)
			return response
	raise Http404("Simulation with the given ID does not exist")

def log(request):
	today = date.today()
	today_filter = Log.objects.values_list('sim_id', flat=True).distinct().filter(timestamp__year=today.year,
									  timestamp__month=today.month,
									  timestamp__day=today.day
									  )
	if request.method == 'POST':
		form = SearchForm(request.POST)

		if form.is_valid():
			sim_id = form.cleaned_data['sim_id']
			logs = Log.objects.filter(sim_id=sim_id)
			path = '/sim/log'
			

			path += '/' + sim_id
			#print(logs)
			#print(sim_id)
			return HttpResponseRedirect(path)
	else:
		form = SearchForm()

	context = {'today_filter':today_filter, 'form':form}
	return render(request, 'sim/log.html', context)

def tutorials(request):
	context = {}
	return render(request, 'sim/tutorials.html', context)