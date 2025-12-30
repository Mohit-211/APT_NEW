import React, { useRef, useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Button, message as antdMessage, Skeleton, Modal } from "antd";
import {
  DownloadOutlined,
  SaveOutlined,
  LoadingOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { ChateProposalEdited } from "@/utils/api/Api";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import "./EditorPage.scss";

interface PreparedBy {
  name?: string;
  org?: string;
  contact?: string;
}

interface ProposalData {
  proposalContent?: string;
  conversation_id?: string;
  message_id?: string;
  preparedBy?: PreparedBy;
}

const CKEditorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  console.log(location,"===>>")
   const proposalData = (location.state as ProposalData) || {};
  const { proposalContent, conversation_id, message_id } = proposalData;

  // const { proposalContent, conversation_id, message_id } = proposalData;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!proposalContent) {
      navigate(-1);
    } else {
      setContent(proposalContent || "<p>Edit your proposal here</p>");
      setLoading(false);
    }
  }, [proposalContent, navigate]);

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const options = {
      margin: [15, 15, 25, 15],
      filename: "proposal.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    return html2pdf().set(options).from(element).save();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        edited_message: content,
        conversation_id,
        message_id,
      };

      const response = await ChateProposalEdited(payload);

      if (response?.status === 200) {
        antdMessage.success("Proposal updated successfully!");
      } else {
        antdMessage.error("Failed to update proposal.");
      }
    } catch (error) {
      console.error("Save Error:", error);
      antdMessage.error("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="editorpage">
      <style>
        {`
          .page-break {
            page-break-before: always;
            break-before: page;
          }
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          * {
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
          }
        `}
      </style>

      {loading ? (
        <>
          <Skeleton active paragraph={{ rows: 8 }} />
          <div className="loading-btns">
            <Skeleton.Button active style={{ width: 100 }} />
            <Skeleton.Button active style={{ width: 120 }} />
          </div>
        </>
      ) : (
        <>
          {/* === TINYMCE EDITOR === */}
          <Editor
            apiKey="f8i59q6p88hcyvaqhicwhyjs2cqwzr8elruwyxphppvzc5yd"
            value={content}
            init={{
              height: 500,
              menubar: true,
              plugins: "table link image lists media charmap emoticons",
              toolbar:
                "undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | " +
                "alignleft aligncenter alignright alignjustify | bullist numlist | link image media table | removeformat",
              font_family_formats: `
                Arial=arial,helvetica,sans-serif;
                Calibri=calibri,arial,helvetica,sans-serif;
                Times New Roman=times new roman,times,serif;
                Georgia=georgia,palatino,serif;
                Verdana=verdana,geneva,sans-serif;
                Courier New=courier new,courier,monospace;
              `,
              automatic_uploads: true,
              file_picker_types: "image",
            }}
            onEditorChange={(val) => setContent(val)}
          />

          {/* === ACTION BUTTONS === */}
          <div className="editor-actions">
            <Button
              icon={saving ? <LoadingOutlined spin /> : <SaveOutlined />}
              type="primary"
              onClick={handleSave}
              className="button_theme"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>

            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadPDF}
              className="button_theme"
              disabled={saving}
            >
              Download PDF
            </Button>

            <Button
              icon={<EyeOutlined />}
              onClick={() => setPreviewVisible(true)}
              className="button_theme"
              disabled={saving}
            >
              Preview
            </Button>
          </div>
        </>
      )}

      {/* === HIDDEN PRINT AREA === */}
      <div style={{ display: "none" }}>
        <div ref={printRef} className="print-container">
          <div
            className="avoid-break"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* === Prepared By Section === */}
          <div className="page-break preparedBy_style">
            {proposalData?.preparedBy?.name && (
              <p>
                <b>Prepared By:</b> {proposalData.preparedBy.name}
              </p>
            )}
            {proposalData?.preparedBy?.org && (
              <p>{proposalData.preparedBy.org}</p>
            )}
            {proposalData?.preparedBy?.contact && (
              <p>{proposalData.preparedBy.contact}</p>
            )}
          </div>

          {/* === Signature Block === */}
          <div className="signature-block page-break">
            <div className="signature-section">
              <h6>
                <b>Signature for Contract Execution</b>
              </h6>

              <p>
                <b>__________________________</b>
              </p>
              <p className="m-0">
                <b>Client Organization</b>
              </p>

              <p>
                <b>__________________________</b>
              </p>
              <p className="m-0">
                <b>Client Authorized Signature</b>
              </p>

              <p>
                <b>__________________________</b>
              </p>
              <p className="m-0">
                <b>Date</b>
              </p>
            </div>

            <div className="signature-section">
              <h6>
                <b>{proposalData?.preparedBy?.org || ""}</b>
              </h6>

              <div style={{ visibility: "hidden" }}>
                <p>
                  <b>__________________________</b>
                </p>
                <p className="m-0">
                  <b>Client Organization</b>
                </p>
              </div>

              <p>
                <b>__________________________</b>
              </p>
              <p className="m-0">
                <b>Authorized Signature</b>
              </p>

              <p>
                <b>__________________________</b>
              </p>
              <p className="m-0">
                <b>Date</b>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === PREVIEW MODAL === */}
      <Modal
        title="Proposal Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="80%"
      >
        <div className="preview-content">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </Modal>
    </div>
  );
};

export default CKEditorPage;
