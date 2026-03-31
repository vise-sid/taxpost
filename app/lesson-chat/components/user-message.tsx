type UserMessageProps = {
  content: string;
};

export const UserMessage = ({ content }: UserMessageProps) => {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-navy px-4 py-3 text-sm text-white">
        {content}
      </div>
    </div>
  );
};
