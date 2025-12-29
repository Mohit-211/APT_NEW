import { useState } from "react";
import { Select, Typography, Space } from "antd";

// import "./MastermindGroup.scss";

const { Title, Text } = Typography;

type ExperienceLevel = "Beginner" | "Intermediate" | "Pro" | "Advanced Pro";

type WeekCount = "4" | "6" | "10";

type PricingData = {
  amount: string;
};

const LEVELS_DATA: Record<ExperienceLevel, Record<WeekCount, PricingData>> = {
  Beginner: {
    "4": { amount: "$50 - $100" },
    "6": { amount: "$65 - $130" },
    "10": { amount: "$100 - $150" },
  },
  Intermediate: {
    "4": { amount: "$100 - $200" },
    "6": { amount: "$130 - $215" },
    "10": { amount: "$150 - $235" },
  },
  Pro: {
    "4": { amount: "$200 - $300" },
    "6": { amount: "$225 - $400" },
    "10": { amount: "$350 - $485" },
  },
  "Advanced Pro": {
    "4": { amount: "$500 - $750" },
    "6": { amount: "$425 - $1,000" },
    "10": { amount: "$1,100 - $2,000" },
  },
};

const EXPERIENCE_OPTIONS = Object.keys(LEVELS_DATA).map((level) => ({
  label: level,
  value: level,
}));

const WEEK_OPTIONS: { label: string; value: WeekCount }[] = [
  { label: "4 weeks", value: "4" },
  { label: "6 weeks", value: "6" },
  { label: "10 weeks", value: "10" },
];

const MastermindGroup: React.FC = () => {
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel | null>(null);
  const [weekCount, setWeekCount] = useState<WeekCount | null>(null);

  const amount =
    experienceLevel && weekCount
      ? LEVELS_DATA[experienceLevel][weekCount].amount
      : "";

  return (
    <div className="MastermindGroup">
      <Title level={5}>Mastermind Group</Title>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Question */}
        <div>
          <Text strong>Question:</Text>
          <Select
            value="I am putting together a Mastermind, how much should I charge?"
            options={[
              {
                label:
                  "I am putting together a Mastermind, how much should I charge?",
                value:
                  "I am putting together a Mastermind, how much should I charge?",
              },
            ]}
            disabled
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        {/* Weeks */}
        <div>
          <Text strong>How many weeks is the Mastermind?</Text>
          <Select<WeekCount>
            placeholder="Select duration"
            value={weekCount}
            options={WEEK_OPTIONS}
            onChange={(value) => setWeekCount(value)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        {/* Experience Level */}
        <div>
          <Text strong>
            Based on information provided, the suggested per person fee should
            be:
          </Text>
          <Select<ExperienceLevel>
            placeholder="Select experience level"
            value={experienceLevel}
            options={EXPERIENCE_OPTIONS}
            onChange={(value) => setExperienceLevel(value)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        {/* Fee Amount */}
        <div className="MastermindGroup__amount">
          <Text strong>Fee Amount:</Text>
          <div className="MastermindGroup__amount-value">{amount || "--"}</div>
        </div>
      </Space>
    </div>
  );
};

export default MastermindGroup;
