const ScheduleSection = () => {
  const schedule = [
    {
      day: "Day 1 - Friday, February 20",
      events: [
        { time: "5:00 PM", title: "Check-in Opens", description: "Get your badge and swag" },
        { time: "6:00 PM", title: "Opening Ceremony", description: "Welcome and event kickoff", room: "Hurthub 303" },
        { time: "7:00 PM", title: "Dinner", description: "Fuel up for the night ahead" },
        { time: "8:00 PM", title: "Hacking Begins", description: "Start building!" },
        { time: "8:00 PM", title: "Hardware Workshop", description: "Eric Beall", room: "Hurthub 208" },
        { time: "9:00 PM", title: "Team Formation", description: "Find your perfect teammates" },
      ],
    },
    {
      day: "Day 2 - Saturday, February 21",
      events: [
        { time: "8:00 AM", title: "Breakfast", description: "Start your day right" },
        { time: "12:00 PM", title: "Lunch", description: "Take a break and refuel" },
        { time: "1:00 PM", title: "Security Workshop", description: "Dr. Mendes", room: "Hurthub 208" },
        { time: "3:00 PM", title: "Data Science Workshop", description: "Dr. Wang", room: "Hurthub 208" },
        { time: "5:00 PM", title: "Co-Pilot Workshop", description: "Genevieve from MLH", room: "Hurthub 208" },
        { time: "6:00 PM", title: "Dinner", description: "Evening meal" },
        { time: "8:00 PM", title: "AI Studio Workshop", description: "Genevieve from MLH", room: "Hurthub 208" },
        { time: "12:00 AM", title: "Midnight Snack", description: "Late night fuel" },
      ],
    },
    {
      day: "Day 3 - Sunday, February 22",
      events: [
        { time: "8:00 AM", title: "Breakfast", description: "Final day fuel" },
        { time: "10:00 AM", title: "Submissions Due", description: "Finalize your projects" },
        { time: "11:00 AM", title: "Judging Begins", description: "Present to our judges" },
        { time: "12:00 PM", title: "Lunch", description: "Meal break" },
        { time: "1:00 PM", title: "Closing Ceremony", description: "Winner announcements and awards", room: "Hurthub 303" },
        { time: "2:00 PM", title: "Happy Hour", description: "Network with tech figures from Silicon Valley" },
        { time: "3:00 PM", title: "Event Ends", description: "See you next year!" },
      ],
    },
  ];

  return (
    <section id="schedule" className="py-16 sm:py-20 md:py-32 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4 sm:mb-6 px-4">Tentative Schedule</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-3 sm:mb-4 px-4">
              Three days of hacking, learning, and fun
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/70 italic px-4">
              Workshops, challenges, and networking events will be announced soon
            </p>
          </div>

          <div className="space-y-8 sm:space-y-12">
            {schedule.map((day, dayIndex) => (
              <div key={dayIndex} className="space-y-4 sm:space-y-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-primary border-b-4 border-accent inline-block pb-2">
                  {day.day}
                </h3>
                <div className="grid gap-3 sm:gap-4">
                  {day.events.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="flex flex-col sm:flex-row gap-3 sm:gap-6 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="text-primary font-bold text-base sm:text-lg whitespace-nowrap">{event.time}</div>
                      <div className="flex-1">
                        <h4 className="text-lg sm:text-xl font-bold text-card-foreground mb-1 flex flex-wrap items-center gap-2">
                          {event.title}
                          {"room" in event && event.room && (
                            <span className="text-sm font-semibold text-accent bg-accent/15 px-2.5 py-0.5 rounded-full">
                              {event.room}
                            </span>
                          )}
                        </h4>
                        <p className="text-sm sm:text-base text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
