from rest_framework import permissions

class IsSystemAdmin(permissions.BasePermission):
    """
    Permission pour autoriser uniquement les Administrateurs Système.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'ADMIN'
        )