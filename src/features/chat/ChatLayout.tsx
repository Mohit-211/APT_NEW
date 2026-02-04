import React, { useState } from "react";
import "./ChatLayout.scss";
import ChatSidebar from "@/features/chat/components/ChatSidebar/ChatSidebar";
import ChatWindow from "@/features/chat/components/ChatWindow/ChatWindow";
import Signin from "@/features/auth/Signin";
import { FaListAlt as FaListAltRaw } from "react-icons/fa";
import { BsX as BsXRaw } from "react-icons/bs";

const FaListAlt = FaListAltRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsX = BsXRaw as React.FC<React.SVGProps<SVGSVGElement>>;

interface Conversation {
  id?: string | number;
  [key: string]: any;
}

const ChatLayout: React.FC = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isToken = localStorage.getItem("UserLoginTokenApt");

  if (!isToken) return <Signin />;

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsSidebarOpen(false);
  };

  return (
    <div className="chat-layout">
      {/* Mobile Sidebar Toggle */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FaListAlt className="toggle-icon" />
        <span>History</span>
      </button>

      {/* Desktop Sidebar - Always Visible */}
      <aside className="desktop-sidebar">
        <ChatSidebar onSelectConversation={handleConversationSelect} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div
            className="sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="mobile-sidebar">
            <div className="mobile-sidebar-header">
              <h2>Chat History</h2>
              <button
                className="close-button"
                onClick={() => setIsSidebarOpen(false)}
              >
                <BsX />
              </button>
            </div>
            <div className="mobile-sidebar-content">
              <ChatSidebar onSelectConversation={handleConversationSelect} />
            </div>
          </aside>
        </>
      )}

      {/* Main Chat Area */}
      <main className="chat-content">
        <ChatWindow
          conversation={selectedConversation}
          onNewConversation={(conv: Conversation) =>
            setSelectedConversation(conv)
          }
          resetTrigger={selectedConversation?.id}
        />
        
      </main>
    </div>
  );
};

export default ChatLayout;
