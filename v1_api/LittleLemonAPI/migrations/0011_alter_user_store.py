# Generated by Django 4.2.2 on 2023-06-26 16:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('LittleLemonAPI', '0010_alter_user_store'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='store',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='LittleLemonAPI.store'),
            preserve_default=False,
        ),
    ]