interface BitsAchievementProps {
  children: React.ReactNode;
}

export function BitsAchievement({ ...props }: BitsAchievementProps) {
  return (
    <div className="flex justify-center">
      <div
        className="flex items-center justify-center gap-x-px rounded-full bg-background-300 border-background-300 border-[3px] overflow-hidden"
        {...props}
      />
    </div>
  );
}

export default BitsAchievement;
