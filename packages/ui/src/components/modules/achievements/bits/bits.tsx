interface AchievementBitsProps {
  children: React.ReactNode;
}

export function AchievementBits({ ...props }: AchievementBitsProps) {
  return (
    <div className="flex justify-center">
      <div
        className="flex items-center justify-center gap-x-px rounded-full bg-background-300 border-background-300 border-[3px] overflow-hidden"
        {...props}
      />
    </div>
  );
}

export default AchievementBits;
