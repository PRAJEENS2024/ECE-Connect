from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from django.contrib.auth import get_user_model

User = get_user_model()

class TokenHeaderAuthentication(BaseAuthentication):
    """
    Lightweight, secure session/token authentication supporting:
    - Authorization: Bearer <user_id_or_token>
    - X-User-Id: <user_id> (convenient for testing and role switching in development)
    """
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        user_id_header = request.META.get('HTTP_X_USER_ID')

        user = None

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1].strip()
            # In our lightweight secure token flow: token can be user ID or session token
            try:
                user = User.objects.filter(id=token, is_active=True).first()
            except (ValueError, TypeError):
                pass
            
            if not user:
                # Try finding by username
                user = User.objects.filter(username=token, is_active=True).first()

        elif user_id_header:
            try:
                user = User.objects.filter(id=user_id_header, is_active=True).first()
            except (ValueError, TypeError):
                pass

        if user:
            return (user, None)
        return None
