function Dashboard({ tasks }) {

  // Calculate task numbers

  const totalTasks = tasks.length;

  const todoTasks = tasks.filter(
    (task) => task.status === "To Do"
  ).length;

  const progressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;


  // Calculate completion percentage

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);


  // Show only first 3 tasks in recent tasks

  const recentTasks = tasks.slice(0, 3);


  return (
    <div>

      {/* Welcome Section */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Good Morning, Krrish 👋
        </h1>

        <p className="text-gray-500 mt-2">
          Here's what's happening with your tasks today.
        </p>

      </div>


      {/* Statistics */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">


        {/* Total */}

        <div className="bg-white p-6 rounded-2xl border border-gray-200">

          <div className="flex justify-between items-center">

            <p className="text-gray-500">
              Total Tasks
            </p>

            <span className="text-xl">
              📋
            </span>

          </div>

          <h2 className="text-3xl font-bold mt-4">
            {totalTasks}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            All your tasks
          </p>

        </div>


        {/* To Do */}

        <div className="bg-white p-6 rounded-2xl border border-gray-200">

          <div className="flex justify-between items-center">

            <p className="text-gray-500">
              To Do
            </p>

            <span className="text-xl">
              📝
            </span>

          </div>

          <h2 className="text-3xl font-bold mt-4">
            {todoTasks}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Tasks waiting
          </p>

        </div>


        {/* In Progress */}

        <div className="bg-white p-6 rounded-2xl border border-gray-200">

          <div className="flex justify-between items-center">

            <p className="text-gray-500">
              In Progress
            </p>

            <span className="text-xl">
              ⏳
            </span>

          </div>

          <h2 className="text-3xl font-bold mt-4 text-yellow-500">
            {progressTasks}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Currently working
          </p>

        </div>


        {/* Completed */}

        <div className="bg-white p-6 rounded-2xl border border-gray-200">

          <div className="flex justify-between items-center">

            <p className="text-gray-500">
              Completed
            </p>

            <span className="text-xl">
              ✅
            </span>

          </div>

          <h2 className="text-3xl font-bold mt-4 text-green-600">
            {completedTasks}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Finished tasks
          </p>

        </div>

      </div>


      {/* Middle Section */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">


        {/* Recent Tasks */}

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">

          <h2 className="text-xl font-bold mb-6">
            Recent Tasks
          </h2>


          {recentTasks.length === 0 ? (

            <p className="text-gray-500">
              No tasks available.
            </p>

          ) : (

            <div className="space-y-4">

              {recentTasks.map((task) => (

                <div
                  key={task._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4"
                >

                  <div>

                    <h3 className="font-semibold">
                      {task.title}
                    </h3>

                    <p className="text-sm text-gray-400 mt-1">
                      Due {task.dueDate}
                    </p>

                  </div>


                  <div className="flex items-center gap-3">


                    {/* Priority */}

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        task.priority === "High"
                          ? "bg-red-100 text-red-600"
                          : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-600"
                      }`}
                    >

                      {task.priority}

                    </span>


                    {/* Status */}

                    <span className="text-sm text-gray-500">
                      {task.status}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>


        {/* Progress */}

        <div className="bg-black text-white rounded-2xl p-6">

          <h2 className="text-xl font-bold">
            Your Progress
          </h2>

          <p className="text-gray-400 text-sm mt-2">
            Keep completing your tasks!
          </p>


          {/* Percentage Circle */}

          <div className="flex justify-center my-8">

            <div className="w-32 h-32 rounded-full border-8 border-yellow-400 flex items-center justify-center">

              <div className="text-center">

                <h3 className="text-3xl font-bold">
                  {completionPercentage}%
                </h3>

                <p className="text-xs text-gray-400">
                  Completed
                </p>

              </div>

            </div>

          </div>


          {/* Progress Bar */}

          <div className="w-full bg-gray-800 rounded-full h-2">

            <div
              className="bg-yellow-400 h-2 rounded-full"
              style={{
                width: `${completionPercentage}%`
              }}
            >
            </div>

          </div>


          <p className="text-sm text-gray-400 mt-3">

            {completedTasks} of {totalTasks} tasks completed

          </p>

        </div>

      </div>


      {/* Bottom Section */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        {/* Task Status Overview */}

        <div className="bg-white rounded-2xl border border-gray-200 p-6">

          <h2 className="text-xl font-bold mb-6">
            Task Status
          </h2>


          <div className="space-y-5">


            <div className="flex justify-between items-center">

              <div className="flex items-center gap-3">

                <div className="w-3 h-3 bg-gray-400 rounded-full">
                </div>

                <span>
                  To Do
                </span>

              </div>

              <span className="font-bold">
                {todoTasks}
              </span>

            </div>


            <div className="flex justify-between items-center">

              <div className="flex items-center gap-3">

                <div className="w-3 h-3 bg-yellow-400 rounded-full">
                </div>

                <span>
                  In Progress
                </span>

              </div>

              <span className="font-bold">
                {progressTasks}
              </span>

            </div>


            <div className="flex justify-between items-center">

              <div className="flex items-center gap-3">

                <div className="w-3 h-3 bg-green-500 rounded-full">
                </div>

                <span>
                  Completed
                </span>

              </div>

              <span className="font-bold">
                {completedTasks}
              </span>

            </div>

          </div>

        </div>


        {/* Priority Overview */}

        <PriorityOverview tasks={tasks} />

      </div>

    </div>
  );
}



/* Priority Component */

function PriorityOverview({ tasks }) {

  const highTasks = tasks.filter(
    (task) => task.priority === "High"
  ).length;

  const mediumTasks = tasks.filter(
    (task) => task.priority === "Medium"
  ).length;

  const lowTasks = tasks.filter(
    (task) => task.priority === "Low"
  ).length;


  return (

    <div className="bg-white rounded-2xl border border-gray-200 p-6">

      <h2 className="text-xl font-bold mb-6">
        Priority Overview
      </h2>


      {/* High */}

      <div className="mb-6">

        <div className="flex justify-between mb-2">

          <span className="text-sm font-medium">
            High Priority
          </span>

          <span className="text-sm">
            {highTasks} Tasks
          </span>

        </div>

        <div className="w-full bg-gray-100 h-2 rounded-full">

          <div
            className="bg-red-500 h-2 rounded-full"
            style={{
              width: `${
                tasks.length === 0
                  ? 0
                  : (highTasks / tasks.length) * 100
              }%`
            }}
          >
          </div>

        </div>

      </div>


      {/* Medium */}

      <div className="mb-6">

        <div className="flex justify-between mb-2">

          <span className="text-sm font-medium">
            Medium Priority
          </span>

          <span className="text-sm">
            {mediumTasks} Tasks
          </span>

        </div>

        <div className="w-full bg-gray-100 h-2 rounded-full">

          <div
            className="bg-yellow-400 h-2 rounded-full"
            style={{
              width: `${
                tasks.length === 0
                  ? 0
                  : (mediumTasks / tasks.length) * 100
              }%`
            }}
          >
          </div>

        </div>

      </div>


      {/* Low */}

      <div>

        <div className="flex justify-between mb-2">

          <span className="text-sm font-medium">
            Low Priority
          </span>

          <span className="text-sm">
            {lowTasks} Tasks
          </span>

        </div>

        <div className="w-full bg-gray-100 h-2 rounded-full">

          <div
            className="bg-green-500 h-2 rounded-full"
            style={{
              width: `${
                tasks.length === 0
                  ? 0
                  : (lowTasks / tasks.length) * 100
              }%`
            }}
          >
          </div>

        </div>

      </div>

    </div>

  );
}


export default Dashboard;