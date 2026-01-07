import React, { useEffect, useRef, useState } from "react";
import { fetchAllConversations } from "@/app/store/slices/conversationSlice";
import ChatInput from "../ChatInput/ChatInput";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./ChatWindow.scss";

/* ICONS */
import { FaCircleInfo as FaCircleInfoRaw } from "react-icons/fa6";
import { BsRobot as BsRobotRaw } from "react-icons/bs";
import { FaRegCopy as FaRegCopyRaw } from "react-icons/fa";
import { FaFileSignature as FaFileSignatureRaw } from "react-icons/fa";
import { AiOutlineExpandAlt, AiOutlineShrink } from "react-icons/ai";
import { BsX as BsXRaw } from "react-icons/bs";
import { FaWandMagicSparkles as FaWandMagicSparklesRaw } from "react-icons/fa6";

import { ChatExpend, ChatPayload, ChatShorte } from "@/utils/api/Api";
import { message, Spin } from "antd";
import ProposalForm from "./ProposalForm";

/* ICON CASTING */
const FaCircleInfo = FaCircleInfoRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsRobot = BsRobotRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const FaRegCopy = FaRegCopyRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const FaFileSignature = FaFileSignatureRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsX = BsXRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const FaWandMagicSparkles = FaWandMagicSparklesRaw as React.FC<React.SVGProps<SVGSVGElement>>;

/* TYPES */
type Nullable<T> = T | null;

interface ChatMessage {
  id: string | number;
  message?: Nullable<string>;
  query?: Nullable<string>;
}
export interface Conversation {
  id?: string | number;
  title?: string;
  template_id?: string;
  business_id?: string;
  chats?: ChatMessage[];
}

interface ChatWindowProps {
  conversation: Conversation | null;
  onNewConversation?: (c: Conversation) => void;
  resetTrigger?: any;
}

export interface Chat {
  id: string;
  message: string | null;
  prompt?: string;
  [key: string]: any;
}

export interface SelectedProposal {
  id: string | number;
  title?: string;
  template_id?: string;
  business_id?: string;
  chats?: Chat[];
}

interface MessageData {
  text: string;
  template_id: string;
  business_id: string;
  auto_price: boolean;
  manual_price?: string;
}

interface SendMessageInput {
  text: string;
  template_id: string;
  business_id: string;
  auto_price: boolean;
  manual_price?: string;
}

/* CUSTOM TOAST */
const showToast = (message: string, type: "success" | "error" = "success") => {
  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2000);
};

/* STREAMING HOOK */
const useChatStream = (
  currentConversation: Conversation | null,
  conversationTitle: string,
  setConversationTitle: (t: string) => void,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setCurrentConversation: React.Dispatch<React.SetStateAction<Conversation | null>>,
  dispatch: any,
  onNewConversation?: (c: Conversation) => void
) => {
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const typingBuffer = useRef("");
  const typingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamedReplyRef = useRef("");

  const streamMessage = async (data: SendMessageInput) => {
    const token = localStorage.getItem("UserLoginTokenApt");
    const text = data.text;
    if (!token || !text.trim()) return;

    const isNew = currentConversation?.id ? 0 : 1;
    const titleToUse = conversationTitle || text;

    const payload: MessageData = {
      text,
      template_id: String(currentConversation?.template_id ?? data.template_id),
      business_id: String(currentConversation?.business_id ?? data.business_id),
      auto_price: data.auto_price,
      manual_price: data.manual_price,
    };

    if (!conversationTitle) setConversationTitle(text);

    const userId = crypto.randomUUID();
    const botId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: userId, query: text, message: null },
      { id: botId, query: null, message: "" },
    ]);

    setLoading(true);
    setIsStreaming(false);

    try {
      const response = await fetch(
        "https://node.automatedpricingtool.io:5000/api/v1/aichat/stream1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({
            is_new: isNew,
            conversation_id: currentConversation?.id ?? "",
            query: payload.text,
            conversation_title: titleToUse,
            template_id: payload.template_id,
            business_id: payload.business_id,
            auto_price: payload.auto_price,
          }),
        }
      );

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      streamedReplyRef.current = "";
      typingBuffer.current = "";

      if (typingInterval.current) {
        clearInterval(typingInterval.current);
        typingInterval.current = null;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const fullChunk = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          if (fullChunk.startsWith("data:")) {
            const chunk = fullChunk.replace(/^data:\s*/, "");
            if (chunk === "[DONE]") {
              setLoading(false);
              setIsStreaming(false);
              if (isNew === 1) dispatch(fetchAllConversations());
              return;
            }

            try {
              const json = JSON.parse(chunk);
              if (json.type === "final") {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    message: json?.token?.chats?.[0]?.message ?? "",
                  };
                  return updated;
                });
                setCurrentConversation(json?.token);
                if (onNewConversation && isNew === 1) onNewConversation(json.token);
                setIsStreaming(false);
              } else if (json.token) {
                setIsStreaming(true);
                const safeToken = json.token.replace(/\n/g, "<br/>");
                streamedReplyRef.current += safeToken;
                typingBuffer.current += safeToken;

                if (!typingInterval.current) {
                  typingInterval.current = setInterval(() => {
                    if (typingBuffer.current.length > 0) {
                      setMessages((prev) => {
                        const updated = [...prev];
                        updated[updated.length - 1] = {
                          ...updated[updated.length - 1],
                          message:
                            (updated[updated.length - 1].message || "") +
                            typingBuffer.current,
                        };
                        return updated;
                      });
                      typingBuffer.current = "";
                    }
                  }, 50);
                }
              }
            } catch (err) {
              console.error("JSON parse err:", err);
            }
          }
          boundary = buffer.indexOf("\n\n");
        }
      }
    } catch (err) {
      showToast("Unable to stream message", "error");
      console.error(err);
    } finally {
      setLoading(false);
      setIsStreaming(false);
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
        typingInterval.current = null;
      }
    }
  };

  return { streamMessage, loading, isStreaming };
};

/* MAIN COMPONENT */
const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  resetTrigger,
  onNewConversation,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(conversation?.chats || []);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(conversation);
  const [conversationTitle, setConversationTitle] = useState(conversation?.title || "");
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [expandLoading, setExpandLoading] = useState<Record<number, boolean>>({});
  const [, setExpandState] = useState<Record<number, "expand" | "shorten" | null>>({});
  const [showTooltip, setShowTooltip] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { streamMessage, loading, isStreaming } = useChatStream(
    currentConversation,
    conversationTitle,
    setConversationTitle,
    setMessages,
    setCurrentConversation,
    dispatch,
    onNewConversation
  );

  useEffect(() => {
    setCurrentConversation(conversation);
    setMessages(conversation?.chats || []);
    setConversationTitle(conversation?.title || "");
    setExpandState({});
  }, [conversation]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isStreaming]);

  const handleGenerateProposal = () => setProposalModalOpen(true);

  const submitProposal = (proposalData: any) => {
    navigate("/proposal-editor", { state: proposalData });
    setProposalModalOpen(false);
  };

  const handleCopy = (htmlString: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    navigator.clipboard.writeText(plainText).then(() => showToast("Copied to clipboard!", "success"));
  };

  const handleExpandShorten = async (msgIndex: number, content: string | null | undefined, type: "expand" | "short") => {
    const conversation_id = currentConversation?.chats?.[0]?.id;
    if (!conversation_id || !content) {
      message.error("Invalid conversation or content");
      return;
    }

    const payload: ChatPayload = { conversation_id, [type === "expand" ? "prompt" : "message"]: content };
    setExpandLoading((prev) => ({ ...prev, [msgIndex]: true }));

    try {
      const res = type === "expand" ? await ChatExpend(payload) : await ChatShorte(payload);
      const updated = res?.data?.data;

      if (updated) {
        setMessages((prev) =>
          prev.map((msg, i) => (i === msgIndex ? { ...msg, message: updated } : msg))
        );
        message.success(type === "expand" ? "Expanded successfully." : "Shortened successfully.");
      }
    } catch (err) {
      console.error(err);
      message.error(`Failed to ${type}`);
    } finally {
      setExpandLoading((prev) => ({ ...prev, [msgIndex]: false }));
    }
  };

  const mapConversation = (convo: Conversation): SelectedProposal => ({
    id: String(convo.id),
    title: convo.title,
    template_id: convo.template_id,
    business_id: convo.business_id,
    chats: convo.chats?.map((chat) => ({
      id: String(chat.id),
      message: chat.message ?? null,
      prompt: chat.query ?? undefined,
    })),
  });

  /* -----------------------------
     SEND MESSAGE
  ----------------------------- */
  const handleSendMessage = (data: {
    text: string;
    template_id: number;
    business_id: number;
    auto_price: boolean;
    manual_price?: string;
  }) => {
    streamMessage({
      text: data.text,
      template_id: String(data.template_id),
      business_id: String(data.business_id),
      auto_price: data.auto_price,
      manual_price: data.manual_price,
    });
  };

  return (
    <div className="chat-window">
      {/* HEADER */}
      <div className="chat-header">
        <div className="header-content">
          <div
            className="info-icon"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <FaCircleInfo />
          </div>
          <h2 className="conversation-title">{conversationTitle || "New Chat"}</h2>
        </div>

        {showTooltip && (
          <div className="header-tooltip">
            <div className="tooltip-title">Welcome to Ask Ceddie</div>
            <div className="tooltip-text">
              Your AI-powered proposal generation assistant. Simply type in your requirements and Ceddie will create a customized proposal.
            </div>
          </div>
        )}
      </div>

      {/* MESSAGES */}
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon"><BsRobot /></div>
            <h3>Start a conversation with Ceddie</h3>
            <p>Ask me anything about creating proposals, pricing, or project details</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id} className="message-group">
            {msg.query && <div className="chat-bubble user"><div className="message-content">{msg.query}</div></div>}
            {msg.message !== null && (
              <div className="chat-bubble bot">
                <div className="bot-avatar"><FaWandMagicSparkles /></div>
                <div className="bot-message-wrapper">
                  <div className="message-content">
                    <span dangerouslySetInnerHTML={{ __html: msg.message || "" }} />
                    {i === messages.length - 1 && isStreaming && <span className="typing-cursor">▌</span>}
                  </div>
                  {msg.message && (
                    <div className="message-actions">
                      <button className="action-button" onClick={() => handleCopy(msg.message!)} title="Copy to Clipboard">
                        <FaRegCopy /><span>Copy</span>
                      </button>
                      <button className="action-button" onClick={handleGenerateProposal} title="Generate Proposal">
                        <FaFileSignature /><span>Proposal</span>
                      </button>
                      <button
                        className="action-button"
                        onClick={() =>
                          handleExpandShorten(i, msg.message, expandLoading[i] ? "short" : "expand")
                        }
                        disabled={expandLoading[i]}
                      >
                        {expandLoading[i] ? <Spin size="small" /> : expandLoading[i] ? <AiOutlineShrink /> : <AiOutlineExpandAlt />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && !isStreaming && (
          <div className="chat-bubble bot">
            <div className="bot-avatar"><FaWandMagicSparkles className="pulse-icon" /></div>
            <div className="bot-message-wrapper">
              <div className="message-content loading">
                <span className="loading-text">Ceddie is thinking</span>
                <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* CHAT INPUT */}
      <ChatInput
        onSendMessage={handleSendMessage}
        resetTrigger={resetTrigger}
        currentConversation={currentConversation}
      />

      {/* PROPOSAL MODAL */}
      {proposalModalOpen && (
        <div className="modal-overlay" onClick={() => setProposalModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Generate Proposal</h2>
              <button className="modal-close" onClick={() => setProposalModalOpen(false)}>
                <BsX />
              </button>
            </div>
            <div className="modal-body">
              <ProposalForm
                onSubmit={submitProposal}
                selectedProposal={currentConversation ? mapConversation(currentConversation) : null}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
