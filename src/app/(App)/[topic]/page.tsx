"use client";
import { ZQuestions } from "@/lib/types/question.types";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useParams } from "next/navigation";

export default function Question() {
  const params = useParams();
  const topic: string = params.topic as string;
  console.log(topic.replaceAll("_", " "));
  const { object, error, isLoading, submit } = useObject({
    api: `/api/${topic}`,
    schema: ZQuestions,
  });
  return (
    
    <div>
      {/* Add ui to take details like is Quiz will be time bounded, if yes then add a timer for each with time spevified by user by default 20sec. how many question per game by default 10,then add a button to start the quiz */}
      {/* user choose the option if correct then option becomes Green Else Red and  then show the correct answer in green. then call api to save the users answer.then apear the next button to go to the next question and also by defaut after 20 sec the next question will be appear if user does not click on next button*/}
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
        <div className='flex flex-col gap-4'>
          {object?.map((question, index) => (
            <div key={index}>
              {question?.text && <h2>{question?.text}</h2>}
              {question?.options && <p>{question?.options.join(", ")}</p>}
              {question?.correctIndex !== undefined && (
                <p>{question?.correctIndex}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {/* on submit button click add a modal to show the report of the quiz . and call api to save the game report in the database.*/}
      {/* Add A Report Card which will show the report of the quiz which include total question, correct answer, wrong answer, time taken, score, and percentage.*/}
      
    </div>
  );
}
