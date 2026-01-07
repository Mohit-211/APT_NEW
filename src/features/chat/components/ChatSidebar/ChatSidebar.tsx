import React, { useEffect, useState } from "react";
import "./ChatSidebar.scss";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { DeleteOutlined, LoadingOutlined, CheckOutlined } from "@ant-design/icons";
/* ICONS */
import {
  BsThreeDotsVertical as BsThreeRaw,
  BsPlus as BsPlusRaw,
  BsBuilding as BsBuildingRaw,
  BsArrowLeft as BsArrowLeftRaw,
} from "react-icons/bs";

const BsThreeDotsVertical = BsThreeRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsPlus = BsPlusRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsBuilding = BsBuildingRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsArrowLeft = BsArrowLeftRaw as React.FC<React.SVGProps<SVGSVGElement>>;

/* MODALS */
import BusinessModal from "./BusinessModal/BusinessModal";

/* API + REDUX */
import { fetchAllConversations } from "@/app/store/slices/conversationSlice";
import {
  DeleteConversationApi,
  GetBusiness,
  GetTemplates,
  PostconversationDetailOfAI,
} from "@/utils/api/Api";

/* TYPES */
interface ConversationItem {
  id: number;
  title: string;
}

interface Business {
  id: number;
  name: string;
  location: string;
  type: string;
}

interface Template {
  id: number;
  name: string;
}

interface ChatSidebarProps {
  onSelectConversation: (conv: any) => void;
  onClearTemplate?: () => void; // Optional: clear selected template
}

/* COMPONENT */
const ChatSidebar: React.FC<ChatSidebarProps> = ({ onSelectConversation, onClearTemplate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletedId, setDeletedId] = useState<number | null>(null);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showDropdownId, setShowDropdownId] = useState<number | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [, setTemplates] = useState<Template[]>([]);
  

  /* Fetch Businesses & Templates */
  useEffect(() => {
    GetBusiness()
      .then((res) => setBusinesses(res?.data?.data || []))
      .catch((e) => console.log("Error fetching businesses:", e));

    GetTemplates()
      .then((res) => setTemplates(res?.data?.data || []))
      .catch((e) => console.log("Error fetching templates:", e));
  }, []);

  /* Fetch Conversations */
  const conversationState = useSelector(
    (state: any) => state?.rootReducer?.conversations || {}
  );

  useEffect(() => {
    dispatch(fetchAllConversations() as any);
  }, [dispatch]);

  /* Select Conversation */
  const handleConversationClick = async (item: ConversationItem) => {
    setSelectedConversationId(item.id);
    try {
      const response = await PostconversationDetailOfAI({ conversation_id: item.id });
      const data = response?.data?.data;
      onSelectConversation(data);
    } catch (err) {
      console.error("Error loading conversation details", err);
      message.error("Failed to load conversation.");
    }
  };

  /* Delete Conversation */
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setShowDropdownId(null);
    try {
      await DeleteConversationApi(id);
      dispatch(fetchAllConversations() as any);
      if (selectedConversationId === id) {
        setSelectedConversationId(null);
        onSelectConversation(null);
      }
      message.success("Conversation deleted");
      setDeletedId(id);
      setTimeout(() => setDeletedId(null), 2000);
    } catch (err) {
      console.error("Error deleting conversation", err);
      message.error("Failed to delete conversation.");
    } finally {
      setDeletingId(null);
    }
  };

  /* New Chat Click */
  const handleNewChatClick = () => {
    setSelectedConversationId(null);
    setSelectedBusiness(null);
    onSelectConversation(null);
    if (onClearTemplate) onClearTemplate(); // Clear selected template if callback provided
  };

  /* Select Business */
  const handleBusinessSelect = (businessId: number) => {
    const business = businesses.find((b) => b.id === businessId) || null;
    setSelectedBusiness(business);
  };

  const handleBusinessSubmit = (formData: any) => {
    const newBusiness: Business = {
      id: businesses.length + 1,
      name: formData.businessName,
      location: formData.location,
      type: formData.type,
    };
    setBusinesses([...businesses, newBusiness]);
    setIsBusinessModalOpen(false);
    message.success("Business added successfully!");
  };

  const handleBackToHome = () => navigate("/");

  return (
    <div className="chat-sidebar">
      {/* BACK BUTTON */}
      <button className="back-to-home-button" onClick={handleBackToHome}>
        <BsArrowLeft className="back-icon" />
        <span>Back to Home</span>
      </button>

      {/* CHAT SECTION */}
      <div className="sidebar-section chat-section">
        <button className="new-chat-button" onClick={handleNewChatClick}>
          <BsPlus className="icon" />
          <span>New Chat</span>
        </button>

        <div className="section-header">
          <h5>Recent Chats</h5>
        </div>

        <ul className="conversation-list">
          {conversationState?.items?.map((item: ConversationItem) => (
            <li
              key={item.id}
              className={`conversation-item-wrapper ${
                selectedConversationId === item.id ? "selected" : ""
              }`}
            >
              <div
                className="conversation-item"
                onClick={() => handleConversationClick(item)}
              >
                <span className="title">{item.title}</span>
              </div>

              {/* Custom Dropdown */}
              <div className="menu-wrapper">
                <button
                  className="menu-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdownId(showDropdownId === item.id ? null : item.id);
                  }}
                >
                  <BsThreeDotsVertical />
                </button>

                {showDropdownId === item.id && (
                  <>
                    <div
                      className="dropdown-overlay"
                      onClick={() => setShowDropdownId(null)}
                    />
                  <div className="custom-dropdown">
  <button
    className="dropdown-item delete"
    onClick={() => handleDelete(item.id)}
    disabled={deletingId === item.id}
  >
    {deletingId === item.id ? (
      <>
        <LoadingOutlined spin /> Deleting
      </>
    ) : deletedId === item.id ? (
      <>
        <CheckOutlined style={{ color: "green" }} /> Deleted
      </>
    ) : (
      <>
        <DeleteOutlined /> Delete
      </>
    )}
  </button>
</div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* BUSINESS SECTION */}
      <div className="sidebar-section business-section">
        <div className="section-header">
          <h5>Business Cards</h5>
          <button
            className="add-business-button"
            onClick={() => setIsBusinessModalOpen(true)}
          >
            <BsPlus />
          </button>
        </div>

        <ul className="business-list">
          {businesses.map((business) => (
            <li
              key={business.id}
              className={`business-card ${
                selectedBusiness?.id === business.id ? "selected" : ""
              }`}
              onClick={() => handleBusinessSelect(business.id)}
            >
              <BsBuilding className="business-icon" />
              <div className="business-info">
                <span className="business-name">{business.name}</span>
                <span className="business-location">{business.location}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* BUSINESS MODAL */}
      <BusinessModal
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
        onSubmit={handleBusinessSubmit}
      />
    </div>
  );
};

export default ChatSidebar;
