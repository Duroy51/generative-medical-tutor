
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    class Role(models.TextChoices):
        APPRENANT = 'APPRENANT', 'Apprenant'
        EXPERT = 'EXPERT', 'Expert'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.APPRENANT)

    #TODO Ajouter plus tard des attributs relatifs aux métriques d'évaluations

    def __str__(self):
        return f"{self.user.username}'s Profile ({self.get_role_display()})"



@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()