from rest_framework import serializers
from rest_framework.authtoken.models import Token
from .models import User, Role, Doctor


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'code', 'name']


class UserSerializer(serializers.ModelSerializer):
    # Пароль принимается только на запись; в ответ не отдаётся.
    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True,
        style={'input_type': 'password'},
    )
    role_code = serializers.CharField(source='role.code', read_only=True, default=None)
    role_name = serializers.CharField(source='role.name', read_only=True, default=None)
    full_name = serializers.SerializerMethodField()
    has_token = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'role_code', 'role_name',
            'first_name', 'last_name', 'middle_name', 'phone', 'is_active',
            'password', 'full_name', 'has_token', 'date_joined',
        ]
        read_only_fields = ['date_joined']

    def get_full_name(self, obj):
        full = " ".join(filter(None, [obj.last_name, obj.first_name, obj.middle_name]))
        return full or obj.get_username()

    def get_has_token(self, obj):
        return Token.objects.filter(user=obj).exists()

    @staticmethod
    def _normalize(validated_data):
        # Пустой телефон → NULL (поле unique, несколько '' нарушили бы ограничение).
        if validated_data.get('phone') == '':
            validated_data['phone'] = None
        return validated_data

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data = self._normalize(validated_data)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data = self._normalize(validated_data)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class DoctorSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'user_name', 'initials', 'email',
            'specialty', 'cabinet', 'color_hex', 'hourly_rate', 'license_number',
        ]

    def get_user_name(self, obj):
        u = obj.user
        full = " ".join(filter(None, [u.last_name, u.first_name]))
        return full or u.get_username()

    def get_initials(self, obj):
        u = obj.user
        return f"{(u.last_name or '')[:1]}{(u.first_name or '')[:1]}".upper() or u.get_username()[:2].upper()
