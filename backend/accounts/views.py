from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import User, Role, Doctor
from .serializers import UserSerializer, RoleSerializer, DoctorSerializer


class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.role and request.user.role.code == 'ADMIN')


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('role').all().order_by('last_name', 'first_name')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    filterset_fields = ['role', 'is_active']

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Профиль текущего пользователя (для шапки и проверки прав на фронте)."""
        return Response(self.get_serializer(request.user).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def generate_token(self, request, pk=None):
        if not request.user.role or request.user.role.code != 'ADMIN':
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'created': created})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def revoke_token(self, request, pk=None):
        if not request.user.role or request.user.role.code != 'ADMIN':
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        Token.objects.filter(user=user).delete()
        return Response({'detail': 'Token revoked.'})


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """Справочник ролей (для формы сотрудника)."""
    queryset = Role.objects.all().order_by('name')
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None


class DoctorViewSet(viewsets.ModelViewSet):
    """Врачи — для форм расписания, записей и справочника настроек."""
    queryset = Doctor.objects.select_related('user').all().order_by('user__last_name')
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    search_fields = ['user__first_name', 'user__last_name', 'specialty']
