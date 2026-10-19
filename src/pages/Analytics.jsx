function Analytics({ tasks = [] }) {

  // ----------------------
  // STATUS COUNTS
  // ----------------------

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


  // ----------------------
  // PRIORITY COUNTS
  // ----------------------

  const highTasks = tasks.filter(
    (task) => task.priority === "High"
  ).length;


  const mediumTasks = tasks.filter(
    (task) => task.priority === "Medium"
  ).length;


  const lowTasks = tasks.filter(
    (task) => task.priority === "Low"
  ).length;


  // ----------------------
  // COMPLETION RATE
  // ----------------------

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );


  // Calculate percentage for bars

  function getPercentage(value) {

    if (totalTasks === 0) {
      return 0;
    }

    return (value / totalTasks) * 100;
  }


  return (
    <div>


      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Analytics
        </h1>

        <p className="text-gray-500 mt-2">
          Analytics calculated from your current tasks.
        </p>

      </div>


      {/* ======================== */}
      {/* STAT CARDS */}
      {/* ======================== */}

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


        {/* Progress */}

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


      {/* ======================== */}
      {/* OVERALL PROGRESS */}
      {/* ======================== */}

      <div className="bg-black text-white rounded-2xl p-6 md:p-8 mb-8">

        <div className="flex justify-between items-center">

          <div>

            <p className="text-yellow-400 text-sm font-semibold">
              OVERALL PROGRESS
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Task Completion
            </h2>

            <p className="text-gray-400 mt-2">
              {completedTasks} of {totalTasks} tasks completed
            </p>

          </div>


          <h2 className="text-4xl md:text-5xl font-bold text-yellow-400">
            {completionRate}%
          </h2>

        </div>


        {/* Progress bar */}

        <div className="bg-gray-800 h-3 rounded-full mt-8">

          <div
            className="bg-yellow-400 h-3 rounded-full"
            style={{
              width: `${completionRate}%`
            }}
          >
          </div>

        </div>

      </div>


      {/* ======================== */}
      {/* STATUS + PRIORITY */}
      {/* ======================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        {/* STATUS */}

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
                  width: `${getPercentage(todoTasks)}%`
                }}
              >
              </div>

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
                  width: `${getPercentage(progressTasks)}%`
                }}
              >
              </div>

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
                  width: `${getPercentage(completedTasks)}%`
                }}
              >
              </div>

            </div>

          </div>

        </div>


        {/* PRIORITY */}

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
                  width: `${getPercentage(highTasks)}%`
                }}
              >
              </div>

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
                  width: `${getPercentage(mediumTasks)}%`
                }}
              >
              </div>

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
                  width: `${getPercentage(lowTasks)}%`
                }}
              >
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Analytics;