import { useState } from "react";


function Tasks({ tasks, setTasks }) {

  // =========================
  // FILTER STATES
  // =========================

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");


  // =========================
  // EDIT STATES
  // =========================

  const [editingTask, setEditingTask] =
    useState(null);

  const [editTitle, setEditTitle] =
    useState("");

  const [editDescription, setEditDescription] =
    useState("");

  const [editPriority, setEditPriority] =
    useState("Medium");

  const [editStatus, setEditStatus] =
    useState("To Do");

  const [editDueDate, setEditDueDate] =
    useState("");


  // =========================
  // GET TOKEN
  // =========================

  const token =
    localStorage.getItem("token");


  // =========================
  // DELETE TASK
  // =========================

  async function deleteTask(id) {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this task?"
      );


    if (!confirmDelete) {
      return;
    }


    try {

      const response = await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Could not delete task"
        );

        return;

      }


      // Remove task from React
      setTasks(
        tasks.filter(
          (task) =>
            task._id !== id
        )
      );


    } catch (error) {

      console.log(
        "DELETE ERROR:",
        error
      );

    }

  }


  // =========================
  // COMPLETE / UNCOMPLETE
  // =========================

  async function toggleComplete(task) {

    let newStatus;


    if (
      task.status === "Completed"
    ) {

      newStatus = "To Do";

    } else {

      newStatus = "Completed";

    }


    try {

      const response = await fetch(
        `http://localhost:5000/api/tasks/${task._id}`,
        {
          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Could not update task"
        );

        return;

      }


      // Update React state
      setTasks(
        tasks.map(
          (item) => {

            if (
              item._id === task._id
            ) {

              return data;

            }

            return item;

          }
        )
      );


    } catch (error) {

      console.log(
        "COMPLETE ERROR:",
        error
      );

    }

  }


  // =========================
  // OPEN EDIT
  // =========================

  function openEdit(task) {

    setEditingTask(task);

    setEditTitle(
      task.title
    );

    setEditDescription(
      task.description || ""
    );

    setEditPriority(
      task.priority || "Medium"
    );

    setEditStatus(
      task.status || "To Do"
    );

    setEditDueDate(
      task.dueDate || ""
    );

  }


  // =========================
  // CLOSE EDIT
  // =========================

  function closeEdit() {

    setEditingTask(null);

  }


  // =========================
  // SAVE EDIT
  // =========================

  async function saveEdit(e) {

    e.preventDefault();


    if (
      editTitle.trim() === ""
    ) {

      alert(
        "Task title cannot be empty"
      );

      return;

    }


    const updatedData = {

      title:
        editTitle,

      description:
        editDescription,

      priority:
        editPriority,

      status:
        editStatus,

      dueDate:
        editDueDate,

    };


    try {

      const response = await fetch(
        `http://localhost:5000/api/tasks/${editingTask._id}`,
        {

          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body:
            JSON.stringify(
              updatedData
            ),

        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Could not update task"
        );

        return;

      }


      // Update React state
      setTasks(
        tasks.map(
          (task) => {

            if (
              task._id === data._id
            ) {

              return data;

            }

            return task;

          }
        )
      );


      // Close modal
      setEditingTask(null);


    } catch (error) {

      console.log(
        "EDIT ERROR:",
        error
      );

    }

  }


  // =========================
  // FILTER TASKS
  // =========================

  const filteredTasks =
    tasks.filter((task) => {

      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );


      const matchesStatus =

        statusFilter === "All" ||

        task.status ===
          statusFilter;


      const matchesPriority =

        priorityFilter === "All" ||

        task.priority ===
          priorityFilter;


      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );

    });


  return (

    <div>


      {/* ===================== */}
      {/* HEADER */}
      {/* ===================== */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          My Tasks
        </h1>

        <p className="text-gray-500 mt-2">
          Manage all your tasks here.
        </p>

      </div>


      {/* ===================== */}
      {/* FILTERS */}
      {/* ===================== */}

      <div className="bg-white p-5 rounded-2xl border border-gray-200 mb-6">

        <div className="grid md:grid-cols-3 gap-4">


          {/* Search */}

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
          />


          {/* Status */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none"
          >

            <option value="All">
              All Status
            </option>

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


          {/* Priority */}

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(
                e.target.value
              )
            }
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none"
          >

            <option value="All">
              All Priority
            </option>

            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>

          </select>

        </div>

      </div>


      {/* ===================== */}
      {/* TASK LIST */}
      {/* ===================== */}

      <div className="space-y-4">


        {filteredTasks.length === 0 ? (

          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">

            <p className="text-gray-500">
              No tasks found.
            </p>

          </div>

        ) : (

          filteredTasks.map(
            (task) => (

              <div
                key={task._id}
                className="bg-white border border-gray-200 rounded-2xl p-5"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">


                  {/* LEFT SIDE */}

                  <div className="flex gap-4">


                    {/* COMPLETE CHECKBOX */}

                    <input
                      type="checkbox"
                      checked={
                        task.status ===
                        "Completed"
                      }
                      onChange={() =>
                        toggleComplete(
                          task
                        )
                      }
                      className="w-5 h-5 mt-1 accent-yellow-400"
                    />


                    <div>

                      {/* TITLE */}

                      <h2
                        className={`text-lg font-bold ${
                          task.status ===
                          "Completed"
                            ? "line-through text-gray-400"
                            : "text-black"
                        }`}
                      >
                        {task.title}
                      </h2>


                      {/* DESCRIPTION */}

                      <p className="text-gray-500 mt-1">
                        {
                          task.description ||
                          "No description"
                        }
                      </p>


                      {/* INFO */}

                      <div className="flex flex-wrap gap-2 mt-4">


                        {/* STATUS */}

                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {task.status}
                        </span>


                        {/* PRIORITY */}

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            task.priority ===
                            "High"

                              ? "bg-red-100 text-red-600"

                              : task.priority ===
                                "Medium"

                              ? "bg-yellow-100 text-yellow-700"

                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {task.priority}
                        </span>


                        {/* DUE DATE */}

                        {task.dueDate && (

                          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">

                            Due: {
                              task.dueDate
                            }

                          </span>

                        )}

                      </div>

                    </div>

                  </div>


                  {/* RIGHT BUTTONS */}

                  <div className="flex gap-3">


                    {/* EDIT */}

                    <button
                      onClick={() =>
                        openEdit(task)
                      }
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium"
                    >
                      Edit
                    </button>


                    {/* DELETE */}

                    <button
                      onClick={() =>
                        deleteTask(
                          task._id
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Delete
                    </button>


                  </div>

                </div>

              </div>

            )
          )

        )}


      </div>


      {/* ===================== */}
      {/* EDIT MODAL */}
      {/* ===================== */}

      {editingTask && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">


          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">


            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                Edit Task
              </h2>

              <button
                onClick={closeEdit}
                className="text-xl font-bold"
              >
                ✕
              </button>

            </div>


            <form onSubmit={saveEdit}>


              {/* TITLE */}

              <label className="block font-medium mb-2">
                Title
              </label>

              <input
                type="text"
                value={editTitle}
                onChange={(e) =>
                  setEditTitle(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-yellow-400"
              />


              {/* DESCRIPTION */}

              <label className="block font-medium mb-2">
                Description
              </label>

              <textarea
                value={
                  editDescription
                }
                onChange={(e) =>
                  setEditDescription(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-yellow-400"
              />


              {/* PRIORITY */}

              <label className="block font-medium mb-2">
                Priority
              </label>

              <select
                value={editPriority}
                onChange={(e) =>
                  setEditPriority(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
              >

                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>

              </select>


              {/* STATUS */}

              <label className="block font-medium mb-2">
                Status
              </label>

              <select
                value={editStatus}
                onChange={(e) =>
                  setEditStatus(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
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


              {/* DUE DATE */}

              <label className="block font-medium mb-2">
                Due Date
              </label>

              <input
                type="date"
                value={editDueDate}
                onChange={(e) =>
                  setEditDueDate(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6"
              />


              {/* BUTTONS */}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeEdit}
                  className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-500 px-5 py-2 rounded-lg font-semibold"
                >
                  Save Changes
                </button>

              </div>


            </form>

          </div>

        </div>

      )}


    </div>

  );

}


export default Tasks;