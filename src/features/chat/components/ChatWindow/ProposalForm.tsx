import React from "react";
import { Form, Input, Button } from "antd";

/* =========================
   TYPES
========================= */
interface Chat {
  id: string;
  message: string | null;
  conversation_id?: string;
}

interface SelectedProposal {
  id?: string | number;
  chats?: Chat[];
}

interface ProposalFormProps {
  selectedProposal: SelectedProposal | null;
  onSubmit: (data: any) => void;
}

/* =========================
   COMPONENT
========================= */
const ProposalForm: React.FC<ProposalFormProps> = ({
  selectedProposal,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: {
    preparedByName: string;
    preparedByOrg: string;
    preparedByContact: string;
  }) => {
    const proposalData = {
      proposalContent: selectedProposal?.chats?.[0]?.message,
      conversation_id: selectedProposal?.chats?.[0]?.conversation_id,
      message_id: selectedProposal?.chats?.[0]?.id,
      preparedBy: {
        name: values.preparedByName,
        org: values.preparedByOrg,
        contact: values.preparedByContact,
      },
    };

    onSubmit(proposalData);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      {/* Prepared By — Name */}
      <Form.Item
        label="Your Name"
        name="preparedByName"
        rules={[{ required: true, message: "Prepared by name is required" }]}
      >
        <Input placeholder="Name" />
      </Form.Item>

      {/* Prepared By — Org */}
      <Form.Item
        label="Your Organization Name"
        name="preparedByOrg"
        rules={[{ required: true, message: "Organization is required" }]}
      >
        <Input placeholder="Organization" />
      </Form.Item>

      {/* Prepared By — Contact */}
      <Form.Item
        label="Your Contact Number"
        name="preparedByContact"
        rules={[
          { required: true, message: "Contact is required" },
          {
            pattern: /^[0-9]{10}$/,
            message: "Please enter a valid 10-digit contact number",
          },
        ]}
      >
        <Input placeholder="Contact" maxLength={10} />
      </Form.Item>

      {/* Submit Button */}
      <Form.Item>
        <Button type="primary" htmlType="submit" className="button_theme">
          Save Proposal
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProposalForm;
