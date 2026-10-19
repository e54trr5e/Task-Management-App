import { useState } from "react";

function Calendar({ tasks }) {

  const today = new Date();

  // Current displayed month
  const [currentMonth, setCurrentMonth] =
    useState(today.getMonth());

  const [currentYear, setCurrentYear] =
    useState(today.getFullYear());


  // Selected date
  const [selectedDate, setSelectedDate] =
    useState(null);


  // Note input
  const [note, setNote] =
    useState("");


  // Get saved notes from localStorage
  const [notes, setNotes] = useState(() => {

    const savedNotes =
      localStorage.getItem("calendarNotes");

    if (savedNotes) {
      return JSON.parse(savedNotes);
    }

    return {};
  });


  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];


  // =========================
  // DAYS IN MONTH
  // =========================

  const daysInMonth =
    new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();


  // First weekday of month
  const firstDay =
    new Date(
      currentYear,
      currentMonth,
      1
    ).getDay();


  const days = [];


  // Empty spaces before day 1
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }


  // Actual days
  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    days.push(day);

  }


  // =========================
  // CREATE DATE
  // =========================

  function createDate(day) {

    const month =
      String(currentMonth + 1)
        .padStart(2, "0");

    const date =
      String(day)
        .padStart(2, "0");


    return `${currentYear}-${month}-${date}`;
  }


  // =========================
  // GET TASKS FOR DAY
  // =========================

  function getTasksForDay(day) {

    if (!day) {
      return [];
    }


    const fullDate =
      createDate(day);


    return tasks.filter(
      (task) =>
        task.dueDate === fullDate
    );
  }


  // =========================
  // SELECT DATE
  // =========================

  function selectDay(day) {

    if (!day) {
      return;
    }


    const date =
      createDate(day);


    setSelectedDate(date);

    setNote("");

  }


  // =========================
  // ADD NOTE
  // =========================

  function addNote(e) {

    e.preventDefault();


    if (!selectedDate) {

      alert("Please select a date");

      return;

    }


    if (note.trim() === "") {

      alert("Please enter a note");

      return;

    }


    const oldNotes =
      notes[selectedDate] || [];


    const updatedNotes = {

      ...notes,

      [selectedDate]: [
        ...oldNotes,
        {
          id: Date.now(),
          text: note,
        },
      ],

    };


    setNotes(updatedNotes);


    localStorage.setItem(
      "calendarNotes",
      JSON.stringify(updatedNotes)
    );


    setNote("");

  }


  // =========================
  // DELETE NOTE
  // =========================

  function deleteNote(id) {

    const updatedDateNotes =
      notes[selectedDate].filter(
        (item) => item.id !== id
      );


    const updatedNotes = {

      ...notes,

      [selectedDate]:
        updatedDateNotes,

    };


    setNotes(updatedNotes);


    localStorage.setItem(
      "calendarNotes",
      JSON.stringify(updatedNotes)
    );

  }


  // =========================
  // PREVIOUS MONTH
  // =========================

  function previousMonth() {

    if (currentMonth === 0) {

      setCurrentMonth(11);

      setCurrentYear(
        currentYear - 1
      );

    } else {

      setCurrentMonth(
        currentMonth - 1
      );

    }


    setSelectedDate(null);

  }


  // =========================
  // NEXT MONTH
  // =========================

  function nextMonth() {

    if (currentMonth === 11) {

      setCurrentMonth(0);

      setCurrentYear(
        currentYear + 1
      );

    } else {

      setCurrentMonth(
        currentMonth + 1
      );

    }


    setSelectedDate(null);

  }


  // =========================
  // CHECK TODAY
  // =========================

  function isToday(day) {

    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );

  }


  return (

    <div>


      {/* ========================= */}
      {/* HEADING */}
      {/* ========================= */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold">
          Calendar
        </h1>

        <p className="text-gray-500 mt-1">
          View tasks and add notes to your calendar.
        </p>

      </div>


      {/* ========================= */}
      {/* CALENDAR + NOTES */}
      {/* ========================= */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


        {/* ========================= */}
        {/* CALENDAR */}
        {/* ========================= */}

        <div className="xl:col-span-2">

          <div className="bg-white border border-gray-200 rounded-2xl p-5 max-w-3xl">


            {/* Month Header */}

            <div className="flex items-center justify-between mb-5">


              {/* Previous */}

              <button
                onClick={previousMonth}
                className="w-9 h-9 bg-gray-100 hover:bg-yellow-400 rounded-lg font-bold"
              >
                ←
              </button>


              {/* Month */}

              <h2 className="text-xl font-bold">

                {months[currentMonth]}{" "}
                {currentYear}

              </h2>


              {/* Next */}

              <button
                onClick={nextMonth}
                className="w-9 h-9 bg-gray-100 hover:bg-yellow-400 rounded-lg font-bold"
              >
                →
              </button>

            </div>


            {/* ========================= */}
            {/* WEEK DAYS */}
            {/* ========================= */}

            <div className="grid grid-cols-7 gap-1 mb-1">

              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (

                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-400 py-2"
                >
                  {day}
                </div>

              ))}

            </div>


            {/* ========================= */}
            {/* CALENDAR DAYS */}
            {/* ========================= */}

            <div className="grid grid-cols-7 gap-1">

              {days.map(
                (day, index) => {

                  const dayTasks =
                    getTasksForDay(day);


                  const date =
                    day
                      ? createDate(day)
                      : null;


                  const hasNotes =
                    date &&
                    notes[date] &&
                    notes[date].length > 0;


                  return (

                    <div
                      key={index}
                      onClick={() =>
                        selectDay(day)
                      }
                      className={`h-20 border rounded-lg p-2 overflow-hidden ${
                        day
                          ? "cursor-pointer hover:border-yellow-400"
                          : "bg-gray-50"
                      } ${
                        isToday(day)
                          ? "bg-yellow-50 border-yellow-400"
                          : "border-gray-200"
                      } ${
                        selectedDate === date
                          ? "ring-2 ring-yellow-400"
                          : ""
                      }`}
                    >

                      {day && (

                        <>

                          {/* Day Number */}

                          <div className="flex justify-between items-center">

                            <span
                              className={`text-xs font-semibold ${
                                isToday(day)
                                  ? "bg-yellow-400 w-6 h-6 rounded-full flex items-center justify-center"
                                  : ""
                              }`}
                            >
                              {day}
                            </span>


                            {/* Note indicator */}

                            {hasNotes && (

                              <span
                                className="w-2 h-2 bg-black rounded-full"
                                title="Note added"
                              ></span>

                            )}

                          </div>


                          {/* Tasks */}

                          <div className="mt-1">

                            {dayTasks
                              .slice(0, 2)
                              .map((task) => (

                                <div
                                  key={task._id}
                                  className={`text-[10px] px-1 py-0.5 rounded mb-1 truncate ${
                                    task.status ===
                                    "Completed"

                                      ? "bg-green-100 text-green-700"

                                      : task.priority ===
                                        "High"

                                      ? "bg-red-100 text-red-600"

                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >

                                  {task.title}

                                </div>

                              ))}


                            {/* More Tasks */}

                            {dayTasks.length > 2 && (

                              <p className="text-[10px] text-gray-400">

                                +
                                {dayTasks.length - 2}{" "}
                                more

                              </p>

                            )}

                          </div>

                        </>

                      )}

                    </div>

                  );

                }
              )}

            </div>

          </div>

        </div>


        {/* ========================= */}
        {/* NOTES PANEL */}
        {/* ========================= */}

        <div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">


            <h2 className="text-xl font-bold">
              Notes
            </h2>


            {/* No Date Selected */}

            {!selectedDate && (

              <div className="mt-6 text-center py-8">

                <p className="text-3xl">
                  📝
                </p>

                <p className="text-gray-500 mt-3 text-sm">
                  Select a date from the
                  calendar to add notes.
                </p>

              </div>

            )}


            {/* Date Selected */}

            {selectedDate && (

              <>

                <p className="text-sm text-gray-500 mt-1 mb-5">

                  {selectedDate}

                </p>


                {/* Add Note */}

                <form
                  onSubmit={addNote}
                >

                  <textarea
                    value={note}
                    onChange={(e) =>
                      setNote(
                        e.target.value
                      )
                    }
                    placeholder="Write a note..."
                    rows="3"
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-yellow-400 resize-none"
                  />


                  <button
                    type="submit"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl mt-3"
                  >
                    + Add Note
                  </button>

                </form>


                {/* ========================= */}
                {/* SAVED NOTES */}
                {/* ========================= */}

                <div className="mt-6">


                  <h3 className="font-semibold mb-3">
                    Saved Notes
                  </h3>


                  {(!notes[selectedDate] ||
                    notes[selectedDate]
                      .length === 0) && (

                    <p className="text-sm text-gray-400">
                      No notes for this date.
                    </p>

                  )}


                  {notes[selectedDate] &&
                    notes[selectedDate].map(
                      (item) => (

                        <div
                          key={item.id}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3"
                        >

                          <p className="text-sm text-gray-700 break-words">
                            {item.text}
                          </p>


                          <div className="flex justify-end mt-2">

                            <button
                              onClick={() =>
                                deleteNote(
                                  item.id
                                )
                              }
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                      )
                    )}

                </div>

              </>

            )}

          </div>

        </div>

      </div>

    </div>

  );
}

export default Calendar;