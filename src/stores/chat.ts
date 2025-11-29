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
    if (!userStore.userId) return;

    try {
      const { data } = await axios.post(
        import.meta.env.VITE_API_URL + "/get-messages",
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

  return { messages, isLoading, loadChatHistory };
});
