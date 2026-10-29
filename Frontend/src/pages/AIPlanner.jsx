import { useState } from "react";
import ReactMarkdown from "react-markdown";

import {
  Sparkles,
  WandSparkles,
  RefreshCw,
  ListChecks,
  Lightbulb,
  Clock,
  Trash2,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

import { API_URL } from "../api";


const AIPlanner = ({
  setGlobalTasks,
}) => {

  // ========================================
  // PLAN STATE
  // ========================================

  const [goal, setGoal] =
    useState("");

  const [plan, setPlan] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ========================================
  // CONVERTED / PREVIEW TASKS STATE
  // ========================================

  const [tasks, setTasks] =
    useState([]);

  const [converting, setConverting] =
    useState(false);

  const [
    convertError,
    setConvertError,
  ] = useState("");


  // ========================================
  // SAVE TASKS STATE
  // ========================================

  const [saving, setSaving] =
    useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState("");

  const [
    saveSuccess,
    setSaveSuccess,
  ] = useState("");


  // ========================================
  // GENERATE AI PLAN
  // ========================================

  const generatePlan =
    async () => {

      if (!goal.trim()) {

        setError(
          "Please enter a goal first."
        );

        return;
      }


      try {

        setLoading(true);

        setError("");
        setConvertError("");
        setSaveError("");
        setSaveSuccess("");

        // Remove previous converted
        // tasks when a new plan
        // is generated.

        setTasks([]);


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          setError(
            "Please log in to use the AI Planner."
          );

          return;
        }


        const response =
          await fetch(
            `${API_URL}/api/ai/generate-plan`,
            {
              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,

              },

              body:
                JSON.stringify({
                  goal:
                    goal.trim(),
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Could not generate plan."
          );
        }


        setPlan(
          data.plan
        );


      } catch (error) {

        console.error(
          "AI Planner Error:",
          error
        );


        setError(
          error.message ||
          "Something went wrong."
        );


      } finally {

        setLoading(false);

      }

    };


  // ========================================
  // CONVERT PLAN TO TASKS
  // ========================================

  const convertToTasks =
    async () => {

      if (!plan) {
        return;
      }


      try {

        setConverting(true);

        setConvertError("");
        setSaveError("");
        setSaveSuccess("");


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          setConvertError(
            "Please log in again."
          );

          return;
        }


        const response =
          await fetch(
            `${API_URL}/api/ai/convert-to-tasks`,
            {
              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,

              },

              body:
                JSON.stringify({
                  plan,
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Could not convert plan to tasks."
          );
        }


        if (
          !Array.isArray(
            data.tasks
          )
        ) {

          throw new Error(
            "Invalid task response from AI."
          );
        }


        // ====================================
        // NORMALIZE AI TASKS
        // ====================================

        const normalizedTasks =
          data.tasks.map(
            (task) => ({

              title:
                task.title || "",

              description:
                task.description ||
                "",

              priority:
                [
                  "High",
                  "Medium",
                  "Low",
                ].includes(
                  task.priority
                )
                  ? task.priority
                  : "Medium",

              dueDate:
                task.dueDate ||
                "",

            })
          );


        setTasks(
          normalizedTasks
        );


      } catch (error) {

        console.error(
          "Convert Tasks Error:",
          error
        );


        setConvertError(
          error.message ||
          "Could not convert plan to tasks."
        );


      } finally {

        setConverting(false);

      }

    };


  // ========================================
  // UPDATE TASK IN PREVIEW
  // ========================================

  const updateTask = (
    index,
    field,
    value
  ) => {

    setTasks(
      (currentTasks) =>
        currentTasks.map(
          (
            task,
            taskIndex
          ) => {

            if (
              taskIndex !== index
            ) {

              return task;

            }


            return {
              ...task,
              [field]: value,
            };

          }
        )
    );


    if (saveError) {
      setSaveError("");
    }


    if (saveSuccess) {
      setSaveSuccess("");
    }

  };


  // ========================================
  // REMOVE TASK FROM PREVIEW
  // ========================================

  const removeTask = (
    index
  ) => {

    setTasks(
      (currentTasks) =>
        currentTasks.filter(
          (_, taskIndex) =>
            taskIndex !== index
        )
    );


    setSaveError("");
    setSaveSuccess("");

  };


  // ========================================
  // ADD AI TASKS TO TASKFLOW
  // ========================================

  const addTasksToTaskFlow =
    async () => {

      if (
        tasks.length === 0
      ) {

        return;

      }


      // ====================================
      // VALIDATE TASK TITLES
      // ====================================

      const hasInvalidTask =
        tasks.some(
          (task) =>
            !task.title ||
            !task.title.trim()
        );


      if (hasInvalidTask) {

        setSaveError(
          "Every task must have a title before saving."
        );

        return;

      }


      try {

        setSaving(true);

        setSaveError("");
        setSaveSuccess("");


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          setSaveError(
            "Please log in again."
          );

          return;

        }


        // ====================================
        // ONE BULK REQUEST FOR ALL AI TASKS
        // ====================================

        const response =
          await fetch(
            `${API_URL}/api/tasks/bulk`,
            {
              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,

              },

              body:
                JSON.stringify({

                  tasks:
                    tasks.map(
                      (task) => ({

                        title:
                          task.title.trim(),

                        description:
                          task.description
                            ?.trim() ||
                          "",

                        priority:
                          task.priority ||
                          "Medium",

                        dueDate:
                          task.dueDate ||
                          null,

                      })
                    ),

                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Could not save tasks."
          );

        }


        // ====================================
        // GET SAVED TASKS FROM BACKEND
        // ====================================

        const savedTasks =
          Array.isArray(
            data.tasks
          )
            ? data.tasks
            : [];


        // ====================================
        // UPDATE GLOBAL APP TASK STATE
        // ====================================
        //
        // This is the important fix.
        //
        // Previously the AI tasks were saved
        // to MongoDB but App.jsx did not know
        // about them until the browser was
        // refreshed.
        //
        // Now the tasks returned from the
        // backend are immediately added to
        // the same global state used by:
        //
        // Dashboard
        // My Tasks
        // Analytics
        // Calendar
        //
        // ====================================

        if (
          savedTasks.length > 0 &&
          typeof setGlobalTasks ===
            "function"
        ) {

          setGlobalTasks(
            (currentTasks) => [

              ...savedTasks,

              ...currentTasks,

            ]
          );

        }


        // ====================================
        // SUCCESS MESSAGE
        // ====================================

        const numberOfTasks =
          savedTasks.length ||
          tasks.length;


        setSaveSuccess(
          `${numberOfTasks} tasks added to TaskFlow successfully.`
        );


        // ====================================
        // CLEAR AI PREVIEW
        // ====================================

        setTasks([]);


      } catch (error) {

        console.error(
          "Save AI Tasks Error:",
          error
        );


        setSaveError(
          error.message ||
          "Could not save tasks."
        );


      } finally {

        setSaving(false);

      }

    };


  // ========================================
  // FORM SUBMIT
  // ========================================

  const handleSubmit = (
    e
  ) => {

    e.preventDefault();

    generatePlan();

  };


  // ========================================
  // REGENERATE PLAN
  // ========================================

  const handleRegenerate =
    () => {

      generatePlan();

    };


  // ========================================
  // UI
  // ========================================

  return (

    <div className="min-h-screen bg-black text-white">

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">


        {/* ===================================
            HEADER
        =================================== */}

        <div className="mb-8">

          <div className="mb-3 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-black">

              <Sparkles
                size={23}
              />

            </div>


            <div>

              <h1 className="text-3xl font-bold tracking-tight">

                AI Planner

              </h1>


              <p className="mt-1 text-sm text-zinc-400">

                Turn your goals into
                actionable plans with AI.

              </p>

            </div>

          </div>

        </div>


        {/* ===================================
            INPUT CARD
        =================================== */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-7">

          <div className="mb-5 flex items-start gap-3">

            <div className="rounded-lg bg-yellow-400/10 p-2 text-yellow-400">

              <Lightbulb
                size={20}
              />

            </div>


            <div>

              <h2 className="font-semibold">

                What do you want to
                accomplish?

              </h2>


              <p className="mt-1 text-sm text-zinc-500">

                Describe your goal,
                deadline and available
                time for a better plan.

              </p>

            </div>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
          >

            <textarea
              value={goal}

              onChange={(e) => {

                setGoal(
                  e.target.value
                );


                if (error) {
                  setError("");
                }

              }}

              maxLength={2000}

              rows={6}

              placeholder="Example: I want to prepare DBMS in 7 days. I can study 3 hours every day."

              className="
                w-full
                resize-none
                rounded-xl
                border
                border-zinc-800
                bg-black
                p-4
                text-sm
                text-white
                outline-none
                transition
                placeholder:text-zinc-600
                focus:border-yellow-400
              "
            />


            <div className="mt-2 flex items-center justify-between">

              <p className="text-xs text-zinc-600">

                Add details for a more
                useful plan.

              </p>


              <p className="text-xs text-zinc-600">

                {goal.length}/2000

              </p>

            </div>


            {/* PLAN ERROR */}

            {error && (

              <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">

                {error}

              </div>

            )}


            {/* GENERATE BUTTON */}

            <button
              type="submit"

              disabled={
                loading ||
                converting ||
                saving ||
                !goal.trim()
              }

              className="
                mt-5
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-yellow-400
                px-5
                py-3
                font-semibold
                text-black
                transition
                hover:bg-yellow-300
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:w-auto
              "
            >

              {loading ? (

                <>

                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />

                  Generating Plan...

                </>

              ) : (

                <>

                  <WandSparkles
                    size={18}
                  />

                  Generate Plan

                </>

              )}

            </button>

          </form>

        </div>


        {/* ===================================
            INITIAL LOADING
        =================================== */}

        {loading && !plan && (

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">

            <div className="flex flex-col items-center justify-center py-8 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400/10">

                <Sparkles
                  size={25}
                  className="animate-pulse text-yellow-400"
                />

              </div>


              <h3 className="font-semibold">

                TaskFlow AI is planning...

              </h3>


              <p className="mt-2 max-w-md text-sm text-zinc-500">

                Analyzing your goal and
                creating a practical plan.

              </p>

            </div>

          </div>

        )}


        {/* ===================================
            GENERATED PLAN
        =================================== */}

        {plan && (

          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">


            {/* PLAN HEADER */}

            <div className="flex flex-col gap-4 border-b border-zinc-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-yellow-400/10 p-2 text-yellow-400">

                  <ListChecks
                    size={21}
                  />

                </div>


                <div>

                  <h2 className="font-semibold">

                    Your AI Plan

                  </h2>


                  <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">

                    <Clock
                      size={13}
                    />

                    Generated by TaskFlow AI

                  </div>

                </div>

              </div>


              <button
                type="button"

                onClick={
                  handleRegenerate
                }

                disabled={
                  loading ||
                  converting ||
                  saving
                }

                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-zinc-700
                  px-4
                  py-2
                  text-sm
                  transition
                  hover:border-yellow-400
                  hover:text-yellow-400
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                <RefreshCw
                  size={15}

                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />


                {loading
                  ? "Regenerating..."
                  : "Regenerate"}

              </button>

            </div>


            {/* ===================================
                MARKDOWN PLAN
            =================================== */}

            <div
              className="
                p-5
                text-sm
                leading-7
                text-zinc-300
                sm:p-7
              "
            >

              <ReactMarkdown

                components={{

                  h1: ({
                    children,
                  }) => (

                    <h1 className="mb-4 mt-7 text-2xl font-bold text-white first:mt-0">

                      {children}

                    </h1>

                  ),


                  h2: ({
                    children,
                  }) => (

                    <h2 className="mb-3 mt-7 text-xl font-bold text-white first:mt-0">

                      {children}

                    </h2>

                  ),


                  h3: ({
                    children,
                  }) => (

                    <h3 className="mb-3 mt-6 text-lg font-semibold text-yellow-400 first:mt-0">

                      {children}

                    </h3>

                  ),


                  p: ({
                    children,
                  }) => (

                    <p className="mb-4 text-zinc-300">

                      {children}

                    </p>

                  ),


                  ul: ({
                    children,
                  }) => (

                    <ul className="mb-5 ml-5 list-disc space-y-2 marker:text-yellow-400">

                      {children}

                    </ul>

                  ),


                  ol: ({
                    children,
                  }) => (

                    <ol className="mb-5 ml-5 list-decimal space-y-2 marker:font-semibold marker:text-yellow-400">

                      {children}

                    </ol>

                  ),


                  li: ({
                    children,
                  }) => (

                    <li className="pl-1 text-zinc-300">

                      {children}

                    </li>

                  ),


                  strong: ({
                    children,
                  }) => (

                    <strong className="font-semibold text-white">

                      {children}

                    </strong>

                  ),


                  code: ({
                    children,
                  }) => (

                    <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-yellow-300">

                      {children}

                    </code>

                  ),

                }}
              >

                {plan}

              </ReactMarkdown>

            </div>


            {/* ===================================
                CONVERT ACTION
            =================================== */}

            <div className="border-t border-zinc-800 bg-black/30 p-5 sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm font-medium text-white">

                    Happy with this plan?

                  </p>


                  <p className="mt-1 text-xs text-zinc-500">

                    Convert the plan into
                    individual TaskFlow
                    tasks.

                  </p>

                </div>


                <button
                  type="button"

                  onClick={
                    convertToTasks
                  }

                  disabled={
                    converting ||
                    loading ||
                    saving
                  }

                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-yellow-400
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-black
                    transition
                    hover:bg-yellow-300
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {converting ? (

                    <>

                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />

                      Converting...

                    </>

                  ) : (

                    <>

                      <ListChecks
                        size={17}
                      />

                      Convert to Tasks

                    </>

                  )}

                </button>

              </div>


              {convertError && (

                <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">

                  {convertError}

                </div>

              )}

            </div>

          </div>

        )}


        {/* ===================================
            TASK PREVIEW
        =================================== */}

        {tasks.length > 0 && (

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950">


            {/* PREVIEW HEADER */}

            <div className="border-b border-zinc-800 p-5 sm:p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-yellow-400/10 p-2 text-yellow-400">

                  <ListChecks
                    size={21}
                  />

                </div>


                <div>

                  <h2 className="font-semibold">

                    Task Preview

                  </h2>


                  <p className="mt-1 text-xs text-zinc-500">

                    {tasks.length}{" "}
                    {tasks.length === 1
                      ? "task"
                      : "tasks"}{" "}
                    generated. Review and
                    edit them before saving.

                  </p>

                </div>

              </div>

            </div>


            {/* ===================================
                EDITABLE TASK LIST
            =================================== */}

            <div className="space-y-4 p-5 sm:p-6">

              {tasks.map(
                (
                  task,
                  index
                ) => (

                  <div
                    key={index}

                    className="
                      rounded-xl
                      border
                      border-zinc-800
                      bg-black
                      p-5
                    "
                  >

                    {/* TASK HEADER */}

                    <div className="mb-5 flex items-center justify-between gap-4">

                      <div>

                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">

                          Task {index + 1}

                        </p>


                        <p className="mt-1 text-xs text-zinc-600">

                          Edit anything before
                          adding it to TaskFlow.

                        </p>

                      </div>


                      <button
                        type="button"

                        onClick={() =>
                          removeTask(
                            index
                          )
                        }

                        disabled={saving}

                        title="Remove task"

                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-zinc-800
                          text-zinc-500
                          transition
                          hover:border-red-500/40
                          hover:bg-red-500/10
                          hover:text-red-400
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >

                        <Trash2
                          size={17}
                        />

                      </button>

                    </div>


                    {/* TITLE */}

                    <div>

                      <label className="mb-2 block text-xs font-medium text-zinc-400">

                        Task Title

                      </label>


                      <input
                        type="text"

                        value={
                          task.title ||
                          ""
                        }

                        onChange={(e) =>
                          updateTask(
                            index,
                            "title",
                            e.target.value
                          )
                        }

                        disabled={saving}

                        maxLength={150}

                        placeholder="Task title"

                        className="
                          w-full
                          rounded-lg
                          border
                          border-zinc-800
                          bg-zinc-950
                          px-4
                          py-3
                          text-sm
                          text-white
                          outline-none
                          transition
                          placeholder:text-zinc-600
                          focus:border-yellow-400
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="mt-4">

                      <label className="mb-2 block text-xs font-medium text-zinc-400">

                        Description

                      </label>


                      <textarea
                        value={
                          task.description ||
                          ""
                        }

                        onChange={(e) =>
                          updateTask(
                            index,
                            "description",
                            e.target.value
                          )
                        }

                        disabled={saving}

                        rows={3}

                        maxLength={1000}

                        placeholder="Task description"

                        className="
                          w-full
                          resize-none
                          rounded-lg
                          border
                          border-zinc-800
                          bg-zinc-950
                          px-4
                          py-3
                          text-sm
                          leading-6
                          text-white
                          outline-none
                          transition
                          placeholder:text-zinc-600
                          focus:border-yellow-400
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      />

                    </div>


                    {/* PRIORITY + DUE DATE */}

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">


                      {/* PRIORITY */}

                      <div>

                        <label className="mb-2 block text-xs font-medium text-zinc-400">

                          Priority

                        </label>


                        <select
                          value={
                            task.priority ||
                            "Medium"
                          }

                          onChange={(e) =>
                            updateTask(
                              index,
                              "priority",
                              e.target.value
                            )
                          }

                          disabled={saving}

                          className="
                            w-full
                            rounded-lg
                            border
                            border-zinc-800
                            bg-zinc-950
                            px-4
                            py-3
                            text-sm
                            text-white
                            outline-none
                            transition
                            focus:border-yellow-400
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >

                          <option value="High">
                            High
                          </option>

                          <option value="Medium">
                            Medium
                          </option>

                          <option value="Low">
                            Low
                          </option>

                        </select>

                      </div>


                      {/* DUE DATE */}

                      <div>

                        <label className="mb-2 block text-xs font-medium text-zinc-400">

                          Due Date

                        </label>


                        <div className="relative">

                          <CalendarDays
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                          />


                          <input
                            type="date"

                            value={
                              task.dueDate ||
                              ""
                            }

                            onChange={(e) =>
                              updateTask(
                                index,
                                "dueDate",
                                e.target.value
                              )
                            }

                            disabled={saving}

                            className="
                              w-full
                              rounded-lg
                              border
                              border-zinc-800
                              bg-zinc-950
                              py-3
                              pl-10
                              pr-4
                              text-sm
                              text-white
                              outline-none
                              transition
                              focus:border-yellow-400
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                              [color-scheme:dark]
                            "
                          />

                        </div>

                      </div>

                    </div>


                    {/* PRIORITY INDICATOR */}

                    <div className="mt-4 flex flex-wrap items-center gap-2">

                      <span className="text-xs text-zinc-500">

                        Current priority:

                      </span>


                      <span
                        className={`
                          rounded-full
                          px-2.5
                          py-1
                          text-xs
                          font-medium

                          ${
                            task.priority ===
                            "High"

                              ? "bg-red-500/10 text-red-400"

                              : task.priority ===
                                "Medium"

                              ? "bg-yellow-400/10 text-yellow-400"

                              : "bg-green-500/10 text-green-400"
                          }
                        `}
                      >

                        {task.priority ||
                          "Medium"}

                      </span>

                    </div>

                  </div>

                )
              )}

            </div>


            {/* ===================================
                SAVE TASKS AREA
            =================================== */}

            <div className="border-t border-zinc-800 bg-black/30 p-5 sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm font-medium text-white">

                    Ready to add these
                    tasks?

                  </p>


                  <p className="mt-1 text-xs text-zinc-500">

                    Review titles,
                    descriptions,
                    priorities and due
                    dates before saving.

                  </p>

                </div>


                <button
                  type="button"

                  onClick={
                    addTasksToTaskFlow
                  }

                  disabled={
                    saving ||
                    tasks.length === 0
                  }

                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-yellow-400
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-black
                    transition
                    hover:bg-yellow-300
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {saving ? (

                    <>

                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />

                      Adding Tasks...

                    </>

                  ) : (

                    <>

                      <ListChecks
                        size={17}
                      />

                      Add{" "}
                      {tasks.length}{" "}
                      {tasks.length === 1
                        ? "Task"
                        : "Tasks"}

                    </>

                  )}

                </button>

              </div>


              {/* SAVE ERROR */}

              {saveError && (

                <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">

                  {saveError}

                </div>

              )}

            </div>

          </div>

        )}


        {/* ===================================
            SAVE SUCCESS
        =================================== */}

        {saveSuccess && (

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-900/50 bg-green-950/20 p-4 text-green-400">

            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />


            <div>

              <p className="text-sm font-semibold">

                Tasks added successfully

              </p>


              <p className="mt-1 text-sm text-green-400/80">

                {saveSuccess}

              </p>


              <p className="mt-1 text-xs text-zinc-500">

                You can now view them
                in My Tasks.

              </p>

            </div>

          </div>

        )}


        {/* ===================================
            SAVE ERROR AFTER PREVIEW DISAPPEARS
        =================================== */}

        {saveError &&
          tasks.length === 0 && (

            <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">

              {saveError}

            </div>

          )}


      </div>

    </div>

  );

};


export default AIPlanner;