# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-01 12:09
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Beacon',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('beacon_id', models.CharField(max_length=100)),
                ('beacon_name', models.CharField(max_length=100)),
            ],
        ),
    ]
