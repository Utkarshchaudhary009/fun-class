import React from "react";

export const MailContent = ({
  type,
  header,
  content,
}: {
  type: string;
  header: string;
  content: string;
}) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className='text-2xl font-bold'>
        {header}
        <span className='text-sm text-gray-500'>- {type}</span>
      </h1>
      <p className='text-sm'>{content}</p>
    </div>
  );
};
