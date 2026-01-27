import React from "react";
import { Modal, Input, message } from "antd";
import "./BusinessModal.scss";

/* ICON CAST (required in your project) */
import { BsX as BsXRaw } from "react-icons/bs";
import { CreateBusniness } from "@/utils/api/Api";
const BsX = BsXRaw as React.FC<React.SVGProps<SVGSVGElement>>;

/* TYPES */
export interface BusinessFormData {
  businessName: string;
  location: string;
  type: string;
  category: string;
  description: string;
}

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BusinessFormData) => void;
}

const { TextArea } = Input;

/* COMPONENT */
const BusinessModal: React.FC<BusinessModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState<BusinessFormData>({
    businessName: "",
    location: "",
    type: "",
    category: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      businessName: "",
      location: "",
      type: "",
      category: "",
      description: "",
    });
  };
  const handleSubmit = async () => {
    if (!formData.businessName || !formData.location) {
      message.error("Please fill in all required fields");
      return;
    }

    const payload = {
      name: formData.businessName,
      location: formData.location,
      type: formData.type,
      category: formData.category,
      description: formData.description,
    };

    try {
      // setLoading(true);

      const response = await CreateBusniness(payload);

      // message.success("Business card added successfully!");

      // Optionally pass data to parent component
      onSubmit && onSubmit(response?.data);

      // Close + reset form
      handleClose();
    } catch (error) {
      message.error("Failed to add business. Try again.");
    } finally {
      // setLoading(false);
    }
  };


  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={550}
      className="custom-modal business-modal"
      closeIcon={<BsX className="close-icon" />}
    >
      <div className="modal-header">
        <h2>Add Business Card</h2>
        <p>Save business details for quick reference</p>
      </div>

      <div className="modal-body">
        {/* Business Name */}
        <div className="form-group">
          <label>
            Business Name <span className="required">*</span>
          </label>
          <Input
            placeholder="Enter business name"
            value={formData.businessName}
            onChange={(e) =>
              setFormData({ ...formData, businessName: e.target.value })
            }
            className="custom-input"
          />
        </div>

        {/* Location */}
        <div className="form-group">
          <label>
            Location <span className="required">*</span>
          </label>
          <Input
            placeholder="City, State/Country"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="custom-input"
          />
        </div>

        {/* Type + Category */}
        <div className="form-row">
          <div className="form-group">
            <label>Type</label>
            <Input
              placeholder="e.g., Technology"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="custom-input"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <Input
              placeholder="e.g., SaaS"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="custom-input"
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description</label>
          <TextArea
            rows={3}
            placeholder="Brief description of the business"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="custom-input"
          />
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn-cancel" onClick={handleClose}>
          Cancel
        </button>

        <button className="btn-submit" onClick={handleSubmit}>
          Add Business
        </button>
      </div>
    </Modal>
  );
};

export default BusinessModal;
