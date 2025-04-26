"use client";
import {ZQuestions } from "@/models/question";
import { experimental_useObject as useObject } from "@ai-sdk/react";
export default function Home() {
  const { object, error, isLoading, submit } = useObject({
    api: "/api/questions",
    schema: ZQuestions,
  });
  return (
    <div>
      <button
        onClick={() => {
          submit("create 10 question based on subject of physics");
        }}
        disabled={isLoading}
        className='bg-blue-500 text-white p-2 rounded-md'
      >
        Generate
      </button>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {object && (
        <div>
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
