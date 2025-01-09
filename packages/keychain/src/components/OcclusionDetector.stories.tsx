import type { Meta, StoryObj } from "@storybook/react";
import { OcclusionDetector } from "./OcclusionDetector";
import { useState } from "react";

const meta = {
  title: "Components/OcclusionDetector",
  component: OcclusionDetector,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof OcclusionDetector>;

export default meta;
type Story = StoryObj<typeof meta>;

function DemoContainer({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState({ x: 60, y: 40 });

  const handleClick = () => {
    setPosition((prev) => ({
      x: prev.x === 60 ? 20 : 60,
      y: prev.y === 40 ? 60 : 40,
    }));
  };

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          height: "300px",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        {children}
      </div>
      {/* Blocking element */}
      <div
        onClick={handleClick}
        style={{
          position: "absolute",
          top: `${position.y}%`,
          left: `${position.x}%`,
          width: "200px",
          height: "200px",
          backgroundColor: "red",
          opacity: 0.5,
          zIndex: 2,
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ padding: "10px", color: "white" }}>Click to move me</div>
      </div>
    </div>
  );
}

export const Default: Story = {
  decorators: [
    (Story) => (
      <DemoContainer>
        <Story />
      </DemoContainer>
    ),
  ],
};
