import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { messageService } from "@/services";
import type { Listing } from "@/types/listing";
import type { Conversation, Message } from "@/types/message";

type MessagesContextValue = {
  conversations: Array<Conversation>;
  createOrOpenConversation: (listing: Listing) => Promise<Conversation>;
  getConversationById: (conversationId: string) => Conversation | undefined;
  getConversationByListingId: (listingId: string) => Conversation | undefined;
  getMessagesByConversationId: (conversationId: string) => Array<Message>;
  isReady: boolean;
  markConversationRead: (conversationId: string) => Promise<void>;
  messages: Array<Message>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
};

const MessagesContext = createContext<MessagesContextValue | null>(null);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Array<Conversation>>([]);
  const [isReady, setIsReady] = useState(false);
  const [messages, setMessages] = useState<Array<Message>>([]);

  const applyServiceState = useCallback(
    (nextState: { conversations: Array<Conversation>; messages: Array<Message> }) => {
      setConversations(nextState.conversations);
      setMessages(nextState.messages);
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    Promise.all([messageService.getConversations(), messageService.getMessages()])
      .then(([storedConversations, storedMessages]) => {
        if (!isMounted) {
          return;
        }

        setConversations(storedConversations);
        setMessages(storedMessages);
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createOrOpenConversation = useCallback(
    async (listing: Listing) => {
      const result = await messageService.openConversationForListing(listing);

      applyServiceState(result);

      if (result.created) {
        setTimeout(() => {
          void messageService.appendAutoReply(result.conversation.id, result.conversation.listingType).then(applyServiceState);
        }, 650);
      }

      return result.conversation;
    },
    [applyServiceState]
  );

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      const result = await messageService.sendMessage(conversationId, text);

      applyServiceState(result);

      if (!result.message || !result.conversation) {
        return;
      }

      const conversation = result.conversation;

      setTimeout(() => {
        void messageService.appendAutoReply(conversationId, conversation.listingType).then(applyServiceState);
      }, 650);
    },
    [applyServiceState]
  );

  const markConversationRead = useCallback(
    async (conversationId: string) => {
      const result = await messageService.markConversationRead(conversationId);
      applyServiceState(result);
    },
    [applyServiceState]
  );

  const getConversationById = useCallback(
    (conversationId: string) => conversations.find((conversation) => conversation.id === conversationId),
    [conversations]
  );

  const getConversationByListingId = useCallback(
    (listingId: string) => conversations.find((conversation) => conversation.listingId === listingId),
    [conversations]
  );

  const getMessagesByConversationId = useCallback(
    (conversationId: string) => messages.filter((message) => message.conversationId === conversationId),
    [messages]
  );

  const value = useMemo<MessagesContextValue>(
    () => ({
      conversations,
      createOrOpenConversation,
      getConversationById,
      getConversationByListingId,
      getMessagesByConversationId,
      isReady,
      markConversationRead,
      messages,
      sendMessage
    }),
    [
      conversations,
      createOrOpenConversation,
      getConversationById,
      getConversationByListingId,
      getMessagesByConversationId,
      isReady,
      markConversationRead,
      messages,
      sendMessage
    ]
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const value = useContext(MessagesContext);

  if (!value) {
    throw new Error("useMessages must be used within MessagesProvider.");
  }

  return value;
}
