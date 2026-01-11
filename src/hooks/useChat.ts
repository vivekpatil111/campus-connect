import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
}

export const useChat = (chatId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Load messages
  useEffect(() => {
    if (!user || !chatId) return;

    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const loadedMessages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        loadedMessages.push({
          id: doc.id,
          ...doc.data()
        } as ChatMessage);
      });
      setMessages(loadedMessages);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive"
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, chatId, toast]);

  // Initialize chat document if it doesn't exist
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !chatId) return;

      try {
        const chatDocRef = doc(db, "chats", chatId);
        const chatDoc = await getDoc(chatDocRef);

        if (!chatDoc.exists()) {
          // Create new chat document
          await setDoc(chatDocRef, {
            participants: [user.uid], // Will be updated when first message is sent
            createdAt: serverTimestamp(),
            lastMessage: "",
            lastMessageTime: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();
  }, [user, chatId]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user || !chatId) return false;

    setIsSending(true);

    try {
      // Get the chat document to update participants
      const chatDocRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatDocRef);

      if (!chatDoc.exists()) {
        throw new Error("Chat document not found");
      }

      const chatData = chatDoc.data();
      const participants = chatData.participants || [];

      // Ensure current user is in participants
      if (!participants.includes(user.uid)) {
        await updateDoc(chatDocRef, {
          participants: [...participants, user.uid]
        });
      }

      // Add message to Firestore
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: user.uid,
        text: text.trim(),
        timestamp: serverTimestamp(),
        read: false
      });

      // Update last message in chat document
      await updateDoc(chatDocRef, {
        lastMessage: text.trim(),
        lastMessageTime: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoading,
    isSending,
    sendMessage
  };
};