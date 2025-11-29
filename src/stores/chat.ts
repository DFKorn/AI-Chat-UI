import { defineStore } from "pinia";
import { ref } from "vue";
import { useUserStore } from "./user";
import axios from "axios";

interface ChatMessage {
  message: string;
  reply: string;
}

interface FormattedMessage {
  role: "user" | "ai";
  content: string;
}

export const useChatStore = defineStore("chat", () => {
  const messages = ref<FormattedMessage[]>([]);
  const isLoading = ref(false);

  const userStore = useUserStore();

  //Load previous chat history
  const loadChatHistory = async () => {
    console.log("Loading chat history...");
    if (!userStore.userId) return;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/get-messages`,
        {
          userId: userStore.userId,
        }
      );

      messages.value = data.messages
        .flatMap((msg: ChatMessage): FormattedMessage[] => [
          { role: "user", content: msg.message },
          { role: "ai", content: msg.reply },
        ])
        .filter((msg: FormattedMessage) => msg.content.trim() !== "");
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  };

  //Send new message to AI
  const sendMessage = async (message: string) => {
    if (!message.trim() || !userStore.userId) return;

    messages.value.push({ role: "user", content: message });

    isLoading.value = true;
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat`,
        {
          userId: userStore.userId,
          message,
        }
      );

      messages.value.push({ role: "ai", content: data.reply });
    } catch (e) {
      console.error("Failed to send message:", e);

      messages.value.push({
        role: "ai",
        content:
          "Sorry, there was an error processing your request. Please try again later.",
      });
    } finally {
      isLoading.value = false;
    }
  };

  return { messages, isLoading, loadChatHistory, sendMessage };
});
