from .models import NumberInput
from django import forms


class NumberInputForm(forms.ModelForm):
    class Meta:
        model = NumberInput
        fields = ['n1', 'n2']
        widgets = {
            'n1': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Enter first number'}),
            'n2': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Enter second number'}),
        }
        labels = {
            'n1': 'First Number',
            'n2': 'Second Number',
        }