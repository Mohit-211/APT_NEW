import { useState } from "react";
import { Select, Typography, Space } from "antd";

// import "./KeynoteSpeaker.scss";

const { Title, Text } = Typography;

type ExperienceLevel = "Beginner" | "Intermediate" | "Pro" | "Advanced Pro";

type LevelData = {
  amount: string;
};

const LEVELS_DATA: Record<ExperienceLevel, LevelData> = {
  Beginner: { amount: "$500 - $750" },
  Intermediate: { amount: "$1,500 - $1,750" },
  Pro: { amount: "$4,500 - $7,000" },
  "Advanced Pro": { amount: "$7,500 - $10,000" },
};

const EXPERIENCE_OPTIONS = Object.keys(LEVELS_DATA).map((level) => ({
  label: level,
  value: level,
}));

const KeynoteSpeaker: React.FC = () => {
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel | null>(null);

  const amount = experienceLevel ? LEVELS_DATA[experienceLevel].amount : "";

  return (
    <div className="KeynoteSpeaker">
      <Title level={5}>Keynote Speaker</Title>
      <Text type="secondary" className="upto_one">
        (up to 1 hour)
      </Text>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Question */}
        <div>
          <Text strong>Question:</Text>
          <Select
            value="I have been asked to be a Keynote Speaker, what should I charge?"
            options={[
              {
                label:
                  "I have been asked to be a Keynote Speaker, what should I charge?",
                value:
                  "I have been asked to be a Keynote Speaker, what should I charge?",
              },
            ]}
            disabled
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        {/* Experience Level */}
        <div>
          <Text strong>Suggested fee is based on experience level:</Text>
          <Select<ExperienceLevel>
            placeholder="Select experience level"
            value={experienceLevel}
            options={EXPERIENCE_OPTIONS}
            onChange={(value) => setExperienceLevel(value)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        {/* Fee Amount */}
        <div className="KeynoteSpeaker__amount">
          <Text strong>Fee Amount:</Text>
          <div className="KeynoteSpeaker__amount-value">{amount || "--"}</div>
        </div>
      </Space>
    </div>
  );
};

export default KeynoteSpeaker;
