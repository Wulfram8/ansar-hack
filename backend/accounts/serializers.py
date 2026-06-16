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
    # Поля для создания нового врача вместе с пользователем (write-only).
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'user_name', 'initials', 'email',
            'specialty', 'cabinet', 'color_hex', 'hourly_rate', 'license_number',
            'first_name', 'last_name', 'new_email', 'phone',
        ]
        extra_kwargs = {'user': {'required': False}}

    def create(self, validated_data):
        first = validated_data.pop('first_name', '').strip()
        last = validated_data.pop('last_name', '').strip()
        email = validated_data.pop('new_email', '').strip()
        phone = validated_data.pop('phone', '').strip()
        user = validated_data.get('user')
        if user is None:
            # Создаём нового пользователя-врача.
            role, _ = Role.objects.get_or_create(code='DOCTOR', defaults={'name': 'Врач'})
            if not email:
                base = (last or 'doctor').lower()
                email = f"{base}.{User.objects.count() + 1}@clinic.local"
            username = email.split('@')[0]
            i = 0
            uname = username
            while User.objects.filter(username=uname).exists():
                i += 1
                uname = f"{username}{i}"
            user = User(
                username=uname, email=email, first_name=first, last_name=last,
                phone=phone or None, role=role,
            )
            user.set_unusable_password()
            user.save()
            validated_data['user'] = user
        return super().create(validated_data)

    def get_user_name(self, obj):
        u = obj.user
        full = " ".join(filter(None, [u.last_name, u.first_name]))
        return full or u.get_username()

    def get_initials(self, obj):
        u = obj.user
        return f"{(u.last_name or '')[:1]}{(u.first_name or '')[:1]}".upper() or u.get_username()[:2].upper()
