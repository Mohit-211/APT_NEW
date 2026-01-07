export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TourStep {
  id: number;
  title: string;
  description: string;
  targetId: string;
}

export const tourSteps: TourStep[] = [
  {
    id: 1,
    title: "Select Business",
    description: "Choose the business you want to create a proposal for.",
    targetId: "tour-business",
  },
  {
    id: 2,
    title: "Choose Template",
    description: "Pick a proposal template.",
    targetId: "tour-template",
  },
  {
    id: 3,
    title: "Write Prompt",
    description: "Describe what you want the AI to generate.",
    targetId: "tour-prompt",
  },
  {
    id: 4,
    title: "Send",
    description: "Generate your proposal instantly.",
    targetId: "tour-send",
  },
];
