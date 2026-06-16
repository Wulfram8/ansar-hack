from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Conversation, Message
from . import services


class AssistantServiceTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="doc", email="doc@x.io", password="pass12345"
        )

    def test_create_conversation_has_greeting(self):
        conv = services.create_conversation(user=self.user)
        self.assertEqual(conv.messages.count(), 1)
        self.assertEqual(conv.messages.first().role, "ASSISTANT")

    def test_send_message_generates_reply_and_actions(self):
        conv = services.create_conversation(user=self.user)
        reply = services.send_message(
            conversation=conv,
            user=self.user,
            content="Проанализируй загруженность врачей",
        )
        self.assertEqual(reply.role, "ASSISTANT")
        self.assertIn("загруженность", reply.content.lower())
        self.assertTrue(len(reply.tool_calls) > 0)
        # user + assistant added on top of greeting
        self.assertEqual(conv.messages.count(), 3)

    def test_first_message_sets_title(self):
        conv = services.create_conversation(user=self.user)
        services.send_message(
            conversation=conv, user=self.user, content="Найди лиды без ответа"
        )
        conv.refresh_from_db()
        self.assertTrue(conv.title.startswith("Найди лиды"))


class AssistantApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="doc2", email="doc2@x.io", password="pass12345"
        )
        self.client.force_authenticate(self.user)

    def test_suggestions_endpoint(self):
        res = self.client.get("/api/assistant/suggestions/")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(len(res.data) > 0)
        self.assertIn("prompt", res.data[0])

    def test_conversation_create_and_send_flow(self):
        create = self.client.post("/api/assistant/conversations/", {}, format="json")
        self.assertEqual(create.status_code, 201)
        conv_id = create.data["id"]

        send = self.client.post(
            f"/api/assistant/conversations/{conv_id}/send/",
            {"content": "Предложи рассылку для реактивации"},
            format="json",
        )
        self.assertEqual(send.status_code, 201)
        self.assertEqual(send.data["role"], "ASSISTANT")

        detail = self.client.get(f"/api/assistant/conversations/{conv_id}/")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(len(detail.data["messages"]), 3)

    def test_conversations_scoped_to_user(self):
        other = get_user_model().objects.create_user(username="other", email="other@x.io", password="x12345678")
        services.create_conversation(user=other)
        res = self.client.get("/api/assistant/conversations/")
        self.assertEqual(res.status_code, 200)
        results = res.data["results"] if isinstance(res.data, dict) else res.data
        self.assertEqual(len(results), 0)
