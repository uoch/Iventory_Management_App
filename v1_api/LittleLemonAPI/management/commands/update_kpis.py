from django.core.management.base import BaseCommand
from LittleLemonAPI.models import GlobalKPI, StoreKPI

class Command(BaseCommand):
    help = 'Update KPIs'

    def handle(self, *args, **options):
        GlobalKPI.update_global_kpi()
        StoreKPI.update_store_kpis()
        self.stdout.write(self.style.SUCCESS('KPIs updated successfully.'))
