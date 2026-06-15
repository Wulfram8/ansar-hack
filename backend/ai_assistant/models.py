from django.db import models
from core.models import BaseModel
from django.conf import settings

class Conversation(BaseModel):
    title = models.CharField(max_length=255, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conversations')
    context = models.JSONField(default=dict)

    def __str__(self):
        return f"Conversation {self.id} for {self.user}"

class Message(BaseModel):
    ROLE_CHOICES = (
        ('USER', 'User'),
        ('ASSISTANT', 'Assistant'),
        ('SYSTEM', 'System'),
        ('TOOL', 'Tool'),
    )
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField(blank=True)
    tool_calls = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"{self.role} message in {self.conversation}"

class Tool(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    parameters_schema = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
