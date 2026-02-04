from django.apps import AppConfig


class EcomappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ecomapp'

    def ready(self):
        import os
        from django.contrib.auth import get_user_model
        from django.db.utils import OperationalError, ProgrammingError

        User = get_user_model()

        try:
            ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
            ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
            ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")

            if not ADMIN_USERNAME or not ADMIN_PASSWORD:
                return

            if not User.objects.filter(username=ADMIN_USERNAME).exists():
                User.objects.create_superuser(
                    username=ADMIN_USERNAME,
                    email=ADMIN_EMAIL,
                    password=ADMIN_PASSWORD,
                )
                print("✅ Admin user created")

        except (OperationalError, ProgrammingError):
            # DB not ready during startup – ignore safely
            pass
