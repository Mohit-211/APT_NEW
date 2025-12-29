import { useState } from "react";
import { Select, Typography, Space } from "antd";

// import "./TrainingSessionhours.scss";

const { Title, Text } = Typography;

type PeopleCount = "20" | "30" | "50" | "75";

type PricingData = {
  people: string;
  amount: string;
};

const LEVELS_DATA: Record<PeopleCount, PricingData> = {
  "20": { people: "Up to 20 people", amount: "$1,400 - $2,000" },
  "30": { people: "Up to 30 people", amount: "$2,100 - $2,900" },
  "50": { people: "Up to 50 people", amount: "$3,500 - $4,500" },
  "75": { people: "Up to 75 people", amount: "$5,250 - $6,000" },
};

const PEOPLE_OPTIONS: { label: string; value: PeopleCount }[] = [
  { label: "20", value: "20" },
  { label: "30", value: "30" },
  { label: "50", value: "50" },
  { label: "75", value: "75" },
];

const TrainingSessionhours: React.FC = () => {
  const [peopleCount, setPeopleCount] = useState<PeopleCount | null>(null);

  const peopleUpto = peopleCount ? LEVELS_DATA[peopleCount].people : "";

  const amount = peopleCount ? LEVELS_DATA[peopleCount].amount : "";

  return (
    <div className="TrainingSessionhours">
      <Title level={5}>Training Session (1–2 Hours)</Title>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Question */}
        <div>
          <Text strong>Question:</Text>
          <Select
            value="I have been asked to facilitate a training session, what should I charge?"
            options={[
              {
                label:
                  "I have been asked to facilitate a training session, what should I charge?",
                value:
                  "I have been asked to facilitate a training session, what should I charge?",
              },
            ]}
            disabled
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        {/* People Count */}
        <div>
          <Text strong>How many people will be in the session?</Text>
          <Select<PeopleCount>
            placeholder="Select number of people"
            value={peopleCount}
            options={PEOPLE_OPTIONS}
            onChange={(value) => setPeopleCount(value)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        {/* People */}
        <div className="TrainingSessionhours__info">
          <Text strong>People:</Text>
          <div className="TrainingSessionhours__value">
            {peopleUpto || "--"}
          </div>
        </div>

        {/* Fee */}
        <div className="TrainingSessionhours__info">
          <Text strong>Fee:</Text>
          <div className="TrainingSessionhours__value">{amount || "--"}</div>
        </div>
      </Space>
    </div>
  );
};

export default TrainingSessionhours;
