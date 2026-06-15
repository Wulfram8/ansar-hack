from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import UserSerializer

class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'admin'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    filterset_fields = ['role']

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def generate_token(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'created': created})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def revoke_token(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        Token.objects.filter(user=user).delete()
        return Response({'detail': 'Token revoked.'})
