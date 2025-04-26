"use client";
import {ZQuestions } from "@/models/question";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useParams } from "next/navigation";

export default function Question() {
    const params = useParams();
    const topic:string =  params.topic as string;
  const { object, error, isLoading, submit } = useObject({
    api: `/api/${topic}`,
    schema: ZQuestions,
  });
  return (
    <div>
      <button
        onClick={() => {
          submit(topic);
        }}
        disabled={isLoading}
        className='bg-blue-500 text-white p-2 rounded-md'
      >
        Generate
      </button>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {object && (
        <div className="flex flex-col gap-4">
          {object?.map(
            (question, index) =>(
                <div key={index}>
                  {question?.text && <h2>{question?.text}</h2>}
                  {question?.options && <p>{question?.options.join(", ")}</p>}
                  {question?.correctIndex !== undefined && (
                    <p>{question?.correctIndex}</p>
                  )}
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
