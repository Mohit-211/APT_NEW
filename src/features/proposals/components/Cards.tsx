import React from "react";
import { FileText, Download, Edit, Eye, File } from "lucide-react";
import "./Cards.scss";

// Types
interface CardData {
  id: number;
  title: string;
  file_name: string;
  file_type: string;
  proposal_type: string;
}

interface CardComponentProps {
  data: CardData;
}

// File type icon mapping
const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case "pdf":
      return <FileText className="card__file-icon card__file-icon--pdf" />;
    case "doc":
    case "docx":
      return <File className="card__file-icon card__file-icon--doc" />;
    default:
      return <FileText className="card__file-icon" />;
  }
};

// File type badge color
const getFileTypeBadgeClass = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case "pdf":
      return "card__badge--pdf";
    case "doc":
    case "docx":
      return "card__badge--doc";
    default:
      return "";
  }
};

const CardComponent: React.FC<CardComponentProps> = ({ data }) => {
  const { title, file_name, file_type, proposal_type } = data;

  const handleView = () => {
    // View logic - open in new tab or modal
    window.open(`/api/proposals/view/${file_name}`, "_blank");
  };

  const handleEdit = () => {
    // Edit logic - navigate to editor
    window.location.href = `/proposals/edit/${data.id}`;
  };

  const handleDownload = () => {
    // Download logic
    const link = document.createElement("a");
    link.href = `/api/proposals/download/${file_name}`;
    link.download = file_name;
    link.click();
  };

  const isEditable =
    proposal_type === "editable" || proposal_type === "template";

  return (
    <div className="card">
      {/* File Type Badge */}
      <span className={`card__badge ${getFileTypeBadgeClass(file_type)}`}>
        {file_type.toUpperCase()}
      </span>

      {/* Icon Section */}
      <div className="card__icon-section">{getFileIcon(file_type)}</div>

      {/* Content */}
      <div className="card__content">
        <h3 className="card__title" title={title}>
          {title}
        </h3>
        <p className="card__filename">{file_name}</p>
      </div>

      {/* Actions */}
      <div className="card__actions">
        <button
          className="card__action card__action--view"
          onClick={handleView}
          title="View Template"
        >
          <Eye size={16} />
          <span>View</span>
        </button>

        {isEditable ? (
          <button
            className="card__action card__action--edit"
            onClick={handleEdit}
            title="Edit Template"
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>
        ) : (
          <button
            className="card__action card__action--download"
            onClick={handleDownload}
            title="Download Template"
          >
            <Download size={16} />
            <span>Download</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CardComponent;
