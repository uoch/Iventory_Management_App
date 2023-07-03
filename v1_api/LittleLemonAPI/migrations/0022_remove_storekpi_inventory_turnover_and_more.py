# Generated by Django 4.2.2 on 2023-07-02 16:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('LittleLemonAPI', '0021_alter_globalkpi_average_inventory_value_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='storekpi',
            name='inventory_turnover',
        ),
        migrations.AlterField(
            model_name='globalkpi',
            name='total_products',
            field=models.IntegerField(default=0),
        ),
    ]