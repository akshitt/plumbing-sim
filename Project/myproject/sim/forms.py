from django import forms

class SearchForm(forms.Form):
	sim_id  = forms.CharField(label='sim_id', max_length=100)

