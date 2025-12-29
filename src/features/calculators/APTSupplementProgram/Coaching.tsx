import { useState } from "react";
import { Select, Typography, Space } from "antd";

// import "./Coaching.scss";

const { Text, Title } = Typography;

type ExperienceLevel = "Beginner" | "Intermediate" | "Pro" | "Advanced Pro";

type LevelData = {
  amount: string;
};

const LEVELS_DATA: Record<ExperienceLevel, LevelData> = {
  Beginner: { amount: "$75 - $100 / hour" },
  Intermediate: { amount: "$150 - $200 / hour" },
  Pro: { amount: "$200 - $250 / hour" },
  "Advanced Pro": { amount: "$500 - $750 / hour" },
};

const EXPERIENCE_OPTIONS = Object.keys(LEVELS_DATA).map((level) => ({
  label: level,
  value: level,
}));

const Coaching: React.FC = () => {
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel | null>(null);

  const amount = experienceLevel ? LEVELS_DATA[experienceLevel].amount : "";

  return (
    <div className="Coaching">
      <Title level={5}>Coaching</Title>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Question */}
        <div>
          <Text strong>Question:</Text>
          <Select
            value="How much should I charge a coaching client?"
            options={[
              {
                label: "How much should I charge a coaching client?",
                value: "How much should I charge a coaching client?",
              },
            ]}
            style={{ width: "100%", marginTop: 4 }}
            disabled
          />
        </div>

        {/* Experience Level */}
        <div>
          <Text strong>Suggested fee is based on experience level:</Text>
          <Select
            placeholder="Select experience level"
            value={experienceLevel}
            options={EXPERIENCE_OPTIONS}
            onChange={(value) => setExperienceLevel(value as ExperienceLevel)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        {/* Amount */}
        <div className="Coaching__amount">
          <Text strong>Fee Amount:</Text>
          <div className="Coaching__amount-value">{amount || "--"}</div>
        </div>
      </Space>
    </div>
  );
};

export default Coaching;
