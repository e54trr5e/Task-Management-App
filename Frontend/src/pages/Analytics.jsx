import {
  useState,
} from "react";

import ReactMarkdown from "react-markdown";

import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Flag,
} from "lucide-react";

import {
  API_URL,
} from "../api";



function Analytics({ tasks = [] }) {

  // ====================================================
  // AI PRODUCTIVITY INSIGHTS STATE
  // ====================================================

  const [
    aiInsights,
    setAiInsights,
  ] = useState("");


  const [
    aiStats,
    setAiStats,
  ] = useState(null);


  const [
    aiLoading,
    setAiLoading,
  ] = useState(false);


  const [
    aiError,
    setAiError,
  ] = useState("");



  // ====================================================
  // STATUS COUNTS
  // ====================================================

  const totalTasks =
    tasks.length;


  const todoTasks =
    tasks.filter(
      (task) =>
        task.status === "To Do"
    ).length;


  const progressTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "In Progress"
    ).length;


  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "Completed"
    ).length;



  // ====================================================
  // PRIORITY COUNTS
  // ====================================================

  const highTasks =
    tasks.filter(
      (task) =>
        task.priority === "High"
    ).length;


  const mediumTasks =
    tasks.filter(
      (task) =>
        task.priority ===
        "Medium"
    ).length;


  const lowTasks =
    tasks.filter(
      (task) =>
        task.priority === "Low"
    ).length;



  // ====================================================
  // COMPLETION RATE
  // ====================================================

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round(
          (
            completedTasks /
            totalTasks
          ) * 100
        );



  // ====================================================
  // BAR PERCENTAGE
  // ====================================================

  function getPercentage(
    value
  ) {

    if (
      totalTasks === 0
    ) {

      return 0;

    }


    return (
      value /
      totalTasks
    ) * 100;

  }



  // ====================================================
  // GENERATE AI PRODUCTIVITY INSIGHTS
  // ====================================================

  async function generateInsights() {

    const token =
      localStorage.getItem(
        "token"
      );


    if (!token) {

      setAiError(
        "Please log in again."
      );

      return;

    }


    try {

      setAiLoading(true);

      setAiError("");


      const response =
        await fetch(
          `${API_URL}/api/ai/productivity-insights`,
          {
            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,

            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Could not generate productivity insights"
        );

      }


      setAiStats(
        data.stats || null
      );


      setAiInsights(
        data.insights || ""
      );


    } catch (error) {

      console.error(
        "AI INSIGHTS ERROR:",
        error
      );


      setAiError(
        error.message ||
        "Something went wrong while generating insights."
      );


    } finally {

      setAiLoading(false);

    }

  }



  return (

    <div>


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Analytics
        </h1>

        <p className="text-gray-500 mt-2">
          Analytics calculated from your current tasks.
        </p>

      </div>



      {/* ================================================= */}
      {/* STAT CARDS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">


        {/* Total */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6">

          <p className="text-gray-500">
            Total Tasks
          </p>

          <h2 className="text-3xl font-bold mt-3">
            {totalTasks}
          </h2>

        </div>



        {/* To Do */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6">

          <p className="text-gray-500">
            To Do
          </p>

          <h2 className="text-3xl font-bold mt-3">
            {todoTasks}
          </h2>

        </div>



        {/* In Progress */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6">

          <p className="text-gray-500">
            In Progress
          </p>

          <h2 className="text-3xl font-bold text-yellow-500 mt-3">
            {progressTasks}
          </h2>

        </div>



        {/* Completed */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6">

          <p className="text-gray-500">
            Completed
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-3">
            {completedTasks}
          </h2>

        </div>

      </div>



      {/* ================================================= */}
      {/* OVERALL PROGRESS */}
      {/* ================================================= */}

      <div className="bg-black text-white rounded-2xl p-6 md:p-8 mb-8">

        <div className="flex justify-between items-center gap-5">

          <div>

            <p className="text-yellow-400 text-sm font-semibold">
              OVERALL PROGRESS
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Task Completion
            </h2>

            <p className="text-gray-400 mt-2">
              {completedTasks} of{" "}
              {totalTasks} tasks
              completed
            </p>

          </div>


          <h2 className="text-4xl md:text-5xl font-bold text-yellow-400">
            {completionRate}%
          </h2>

        </div>



        {/* Progress bar */}

        <div className="bg-gray-800 h-3 rounded-full mt-8">

          <div
            className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
            style={{
              width:
                `${completionRate}%`,
            }}
          />

        </div>

      </div>



      {/* ================================================= */}
      {/* STATUS + PRIORITY */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">


        {/* ================================================= */}
        {/* STATUS */}
        {/* ================================================= */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6">

          <h2 className="text-xl font-bold mb-6">
            Task Status
          </h2>



          {/* To Do */}

          <div className="mb-6">

            <div className="flex justify-between mb-2">

              <span>
                To Do
              </span>

              <span>
                {todoTasks}
              </span>

            </div>


            <div className="bg-gray-100 h-3 rounded-full">

              <div
                className="bg-gray-500 h-3 rounded-full"
                style={{
                  width:
                    `${getPercentage(
                      todoTasks
                    )}%`,
                }}
              />

            </div>

          </div>



          {/* In Progress */}

          <div className="mb-6">

            <div className="flex justify-between mb-2">

              <span>
                In Progress
              </span>

              <span>
                {progressTasks}
              </span>

            </div>


            <div className="bg-gray-100 h-3 rounded-full">

              <div
                className="bg-yellow-400 h-3 rounded-full"
                style={{
                  width:
                    `${getPercentage(
                      progressTasks
                    )}%`,
                }}
              />

            </div>

          </div>



          {/* Completed */}

          <div>

            <div className="flex justify-between mb-2">

              <span>
                Completed
              </span>

              <span>
                {completedTasks}
              </span>

            </div>


            <div className="bg-gray-100 h-3 rounded-full">

              <div
                className="bg-green-500 h-3 rounded-full"
                style={{
                  width:
                    `${getPercentage(
                      completedTasks
                    )}%`,
                }}
              />

            </div>

          </div>

        </div>



        {/* ================================================= */}
        {/* PRIORITY */}
        {/* ================================================= */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6">

          <h2 className="text-xl font-bold mb-6">
            Priority Distribution
          </h2>



          {/* High */}

          <div className="mb-6">

            <div className="flex justify-between mb-2">

              <span className="text-red-600">
                High
              </span>

              <span>
                {highTasks}
              </span>

            </div>


            <div className="bg-gray-100 h-3 rounded-full">

              <div
                className="bg-red-500 h-3 rounded-full"
                style={{
                  width:
                    `${getPercentage(
                      highTasks
                    )}%`,
                }}
              />

            </div>

          </div>



          {/* Medium */}

          <div className="mb-6">

            <div className="flex justify-between mb-2">

              <span className="text-yellow-600">
                Medium
              </span>

              <span>
                {mediumTasks}
              </span>

            </div>


            <div className="bg-gray-100 h-3 rounded-full">

              <div
                className="bg-yellow-400 h-3 rounded-full"
                style={{
                  width:
                    `${getPercentage(
                      mediumTasks
                    )}%`,
                }}
              />

            </div>

          </div>



          {/* Low */}

          <div>

            <div className="flex justify-between mb-2">

              <span className="text-green-600">
                Low
              </span>

              <span>
                {lowTasks}
              </span>

            </div>


            <div className="bg-gray-100 h-3 rounded-full">

              <div
                className="bg-green-500 h-3 rounded-full"
                style={{
                  width:
                    `${getPercentage(
                      lowTasks
                    )}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>



      {/* ================================================= */}
      {/* PHASE 3 - AI PRODUCTIVITY INSIGHTS */}
      {/* ================================================= */}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">


        {/* AI HEADER */}

        <div className="bg-black text-white p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">


            <div className="flex items-start gap-4">

              <div className="bg-yellow-400 text-black p-3 rounded-xl">

                <Sparkles
                  size={24}
                />

              </div>


              <div>

                <p className="text-yellow-400 text-sm font-semibold">
                  TASKFLOW AI
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  AI Productivity Insights
                </h2>

                <p className="text-gray-400 mt-2 max-w-xl">
                  Let AI analyze your task
                  progress, priorities and
                  deadlines to recommend what
                  you should focus on next.
                </p>

              </div>

            </div>



            {/* Generate / Refresh */}

            <button
              onClick={
                generateInsights
              }
              disabled={
                aiLoading
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                bg-yellow-400
                hover:bg-yellow-300
                disabled:bg-yellow-200
                disabled:cursor-not-allowed
                text-black
                font-semibold
                px-5
                py-3
                rounded-xl
                transition
                shrink-0
              "
            >

              {aiLoading ? (

                <>

                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />

                  Analyzing...

                </>

              ) : aiInsights ? (

                <>

                  <RefreshCw
                    size={18}
                  />

                  Refresh Insights

                </>

              ) : (

                <>

                  <Sparkles
                    size={18}
                  />

                  Generate Insights

                </>

              )}

            </button>

          </div>

        </div>



        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {aiError && (

          <div className="m-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-3">

            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>

              <p className="font-semibold">
                Could not generate insights
              </p>

              <p className="text-sm mt-1">
                {aiError}
              </p>

            </div>

          </div>

        )}



        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {aiLoading && (

          <div className="p-8">

            <div className="flex flex-col items-center justify-center py-10">

              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">

                <Sparkles
                  size={26}
                  className="text-yellow-600 animate-pulse"
                />

              </div>

              <h3 className="font-bold text-lg mt-5">
                Analyzing your productivity
              </h3>

              <p className="text-gray-500 text-center mt-2 max-w-md">
                TaskFlow AI is reviewing your
                tasks, priorities and deadlines.
              </p>

            </div>

          </div>

        )}



        {/* ================================================= */}
        {/* INITIAL EMPTY STATE */}
        {/* ================================================= */}

        {!aiLoading &&
          !aiInsights &&
          !aiError && (

          <div className="p-8">

            <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center">

              <Sparkles
                size={32}
                className="mx-auto text-yellow-500"
              />

              <h3 className="font-bold text-lg mt-4">
                Get personalized productivity insights
              </h3>

              <p className="text-gray-500 mt-2 max-w-lg mx-auto">
                Generate an AI analysis to
                discover overdue work,
                high-priority tasks and your
                recommended next action.
              </p>

            </div>

          </div>

        )}



        {/* ================================================= */}
        {/* AI RESULT */}
        {/* ================================================= */}

        {!aiLoading &&
          aiInsights && (

          <div className="p-6 md:p-8">


            {/* ============================================= */}
            {/* AI STAT CARDS */}
            {/* ============================================= */}

            {aiStats && (

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">


                {/* Completion */}

                <div className="bg-green-50 border border-green-100 rounded-xl p-4">

                  <div className="flex items-center gap-2 text-green-700">

                    <CheckCircle2
                      size={18}
                    />

                    <span className="text-sm font-medium">
                      Completion
                    </span>

                  </div>

                  <p className="text-2xl font-bold mt-3">
                    {aiStats.completionRate}%
                  </p>

                </div>



                {/* Pending */}

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

                  <div className="flex items-center gap-2 text-gray-600">

                    <Clock3
                      size={18}
                    />

                    <span className="text-sm font-medium">
                      Pending
                    </span>

                  </div>

                  <p className="text-2xl font-bold mt-3">
                    {aiStats.pending}
                  </p>

                </div>



                {/* Overdue */}

                <div className="bg-red-50 border border-red-100 rounded-xl p-4">

                  <div className="flex items-center gap-2 text-red-600">

                    <AlertTriangle
                      size={18}
                    />

                    <span className="text-sm font-medium">
                      Overdue
                    </span>

                  </div>

                  <p className="text-2xl font-bold mt-3 text-red-600">
                    {aiStats.overdue}
                  </p>

                </div>



                {/* High Priority */}

                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">

                  <div className="flex items-center gap-2 text-yellow-700">

                    <Flag
                      size={18}
                    />

                    <span className="text-sm font-medium">
                      High Priority
                    </span>

                  </div>

                  <p className="text-2xl font-bold mt-3">
                    {
                      aiStats.highPriorityPending
                    }
                  </p>

                </div>

              </div>

            )}



            {/* ============================================= */}
            {/* GEMINI RESPONSE */}
            {/* ============================================= */}

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 md:p-7">

              <div className="flex items-center gap-3 mb-6">

                <div className="bg-black text-yellow-400 w-10 h-10 rounded-xl flex items-center justify-center">

                  <Sparkles
                    size={20}
                  />

                </div>

                <div>

                  <h3 className="font-bold">
                    TaskFlow AI Analysis
                  </h3>

                  <p className="text-xs text-gray-500">
                    Based on your current tasks
                  </p>

                </div>

              </div>


              <div
                className="
                  text-gray-700
                  leading-7

                  [&_h2]:text-lg
                  [&_h2]:font-bold
                  [&_h2]:text-black
                  [&_h2]:mt-6
                  [&_h2]:mb-2

                  [&_h2:first-child]:mt-0

                  [&_ul]:list-disc
                  [&_ul]:pl-5
                  [&_ul]:my-3

                  [&_li]:mb-1

                  [&_p]:mb-3

                  [&_strong]:font-semibold
                  [&_strong]:text-black
                "
              >

                <ReactMarkdown>
                  {aiInsights}
                </ReactMarkdown>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}


export default Analytics;