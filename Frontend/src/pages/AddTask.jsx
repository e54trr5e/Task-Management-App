import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddTask({ tasks, setTasks }) {

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState("Medium");

  const [status, setStatus] = useState("To Do");

  const [dueDate, setDueDate] = useState("");


  const navigate = useNavigate();

  async function handleSubmit(e) {

  e.preventDefault();


  if (title.trim() === "") {

    alert(
      "Please enter a task title"
    );

    return;

  }


  const token =
    localStorage.getItem("token");


  const newTask = {

    title,
    description,
    priority,
    status,
    dueDate,

  };


  try {

    const response = await fetch(
      "http://localhost:5000/api/tasks",
      {
        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,

        },

        body: JSON.stringify(
          newTask
        ),
      }
    );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.message ||
        "Could not add task"
      );

      return;

    }


    setTasks([
      ...tasks,
      data,
    ]);


    navigate("/tasks");


  } catch (error) {

    console.log(
      "Error adding task:",
      error
    );

  }

}

  return (
    <div>

      {/* Heading */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Add New Task
        </h1>

        <p className="text-gray-500 mt-2">
          Create a new task and organize your work.
        </p>

      </div>


      {/* Form */}

      <div className="max-w-3xl bg-white border border-gray-200 rounded-2xl p-6 md:p-8">

        <form onSubmit={handleSubmit}>


          {/* Title */}

          <div className="mb-5">

            <label className="block font-medium mb-2">
              Task Title
            </label>

            <input
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
            />

          </div>


          {/* Description */}

          <div className="mb-5">

            <label className="block font-medium mb-2">
              Description
            </label>

            <textarea
              placeholder="Enter task description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
            >
            </textarea>

          </div>


          {/* Priority and Status */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


            <div>

              <label className="block font-medium mb-2">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
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


            <div>

              <label className="block font-medium mb-2">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >

                <option value="To Do">
                  To Do
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

              </select>

            </div>

          </div>


          {/* Due Date */}

          <div className="mt-5">

            <label className="block font-medium mb-2">
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(e) =>
                setDueDate(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />

          </div>


          {/* Buttons */}

          <div className="flex gap-3 mt-8">

            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl"
            >
              Add Task
            </button>


            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-xl"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddTask;