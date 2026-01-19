
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )

        user.set_password(validated_data['password'])
        user.save()
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)
        token['username'] = user.username

        try:
            token['role'] = user.profile.role
        except UserProfile.DoesNotExist:
            token['role'] = None

        return token


class UserDetailSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    skill_matrix = serializers.JSONField(source='profile.skill_matrix', read_only=True)

    detailed_analysis = serializers.JSONField(source='profile.detailed_profile_analysis', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'skill_matrix', 'detailed_analysis',
                  'date_joined']


# ... imports existants ...

class UserAdminSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour la gestion des utilisateurs par l'admin.
    """
    role = serializers.CharField(source='profile.role')  # On rend le rôle modifiable

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined', 'role']
        read_only_fields = ['date_joined']

    def update(self, instance, validated_data):
        # Gestion spécifique pour la mise à jour du rôle (qui est dans le profil)
        profile_data = validated_data.pop('profile', {})
        role = profile_data.get('role')

        # Mise à jour des champs User standard
        instance = super().update(instance, validated_data)

        # Mise à jour du rôle dans le profil
        if role:
            instance.profile.role = role
            instance.profile.save()

        return instance


class UserCreateExpertSerializer(serializers.ModelSerializer):
    """
    Pour créer un expert rapidement.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        # On force le rôle EXPERT
        user.profile.role = 'EXPERT'
        user.profile.save()
        return user