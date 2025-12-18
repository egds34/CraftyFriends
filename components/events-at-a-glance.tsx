import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
// Import Prisma Event type
import { Event } from "@prisma/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "./ui/button"

interface EventInfo {
    title: string;
    description: string;
    icon: string;
    howTo: string[];
    rules: string[];
}

interface EventsAtAGlanceProps {
    events: Event[]
    eventTemplates: EventInfo[]
}

export function EventsAtAGlance({ events, eventTemplates }: EventsAtAGlanceProps) {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [selectedInfo, setSelectedInfo] = useState<EventInfo | null>(null)

    const matchingInfo = selectedEvent ? eventTemplates?.find(info =>
        selectedEvent.title.toLowerCase().includes(info.title.toLowerCase().split(' ')[0]) ||
        info.title.toLowerCase().includes(selectedEvent.title.toLowerCase())
    ) : null

    return (
        <section className="py-24 bg-background relative overflow-hidden text-black">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                        Events, at a Glance
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Never miss a moment. Check out our live hourly schedule and upcoming major events.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Hourly Schedule (TV Guide Style) */}
                    <HourlySchedule events={events} onEventClick={setSelectedEvent} />

                    {/* Weekly & Monthly Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <WeeklyCalendar events={events} onEventClick={setSelectedEvent} />
                        <MonthlyCalendar events={events} onEventClick={setSelectedEvent} />
                    </div>
                </div>

                {/* Event Details Modal */}
                <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className={cn(
                                    selectedEvent?.type === 'GAME' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                        selectedEvent?.type === 'COMPETITION' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                            selectedEvent?.type === 'SOCIAL' ? "bg-pink-500/10 text-pink-500 border-pink-500/20" :
                                                "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                )}>
                                    {selectedEvent?.type}
                                </Badge>
                                <span className="text-muted-foreground text-sm font-medium">
                                    {(selectedEvent as any)?.startTime && new Date((selectedEvent as any).startTime).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <DialogTitle className="text-2xl font-heading">{selectedEvent?.title}</DialogTitle>
                            <DialogDescription className="text-base pt-2 leading-relaxed">
                                {selectedEvent?.description || "No description provided."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4 mt-2">
                            <div className="flex flex-col bg-muted/30 p-3 rounded-lg border border-border/50">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase mb-1">
                                    <Clock className="w-3 h-3" /> Time
                                </div>
                                <span className="font-mono text-sm text-black">
                                    {(selectedEvent as any)?.startTime && new Date((selectedEvent as any).startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex flex-col bg-muted/30 p-3 rounded-lg border border-border/50">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase mb-1">
                                    <Calendar className="w-3 h-3" /> Duration
                                </div>
                                <span className="font-mono text-sm text-black">{selectedEvent?.durationMinutes} minutes</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 mt-4">
                            {matchingInfo && (
                                <Button
                                    variant="premium"
                                    className="w-full h-12 flex items-center justify-center gap-2 shadow-md"
                                    onClick={() => {
                                        setSelectedEvent(null)
                                        setSelectedInfo(matchingInfo)
                                    }}
                                >
                                    <span className="text-xl">{matchingInfo.icon}</span>
                                    View Rules & Official Guide
                                </Button>
                            )}
                            <Button variant="outline" className="w-full h-11" onClick={() => setSelectedEvent(null)}>
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Event Info Modal (Rules & Guide) */}
                <Dialog open={!!selectedInfo} onOpenChange={(open) => !open && setSelectedInfo(null)}>
                    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                        {selectedInfo && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-4xl font-heading text-center mb-2 mt-4">{selectedInfo.title}</DialogTitle>
                                    <DialogDescription className="text-center text-lg">{selectedInfo.description}</DialogDescription>
                                </DialogHeader>

                                <div className="grid md:grid-cols-2 gap-8 py-8">
                                    <div className="space-y-6">
                                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                            <h4 className="font-heading font-bold text-xl mb-4 flex items-center gap-2 text-black">
                                                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">?</span>
                                                How to Play
                                            </h4>
                                            <ul className="space-y-3">
                                                {selectedInfo.howTo.map((step, i) => (
                                                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-black/70">
                                                        <span className="text-primary font-bold">{i + 1}.</span>
                                                        {step}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
                                            <h4 className="font-heading font-bold text-xl mb-4 flex items-center gap-2 text-amber-700">
                                                <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">!</span>
                                                Rules & Conduct
                                            </h4>
                                            <ul className="space-y-3">
                                                {selectedInfo.rules.map((rule, i) => (
                                                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-black/70">
                                                        <span className="text-amber-500 pr-1">•</span>
                                                        {rule}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center pb-4">
                                    <Button variant="outline" size="lg" className="px-12 rounded-xl" onClick={() => setSelectedInfo(null)}>
                                        Got it!
                                    </Button>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    )
}

function HourlySchedule({ events, onEventClick }: { events: Event[], onEventClick: (event: Event) => void }) {
    const [currentTime, setCurrentTime] = useState(new Date())
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Filter events to only show those active in the next 24 hours (or recent past)
    // Actually the mock logic generated events for "next 24 hours".
    // We should filter 'events' to be within range: now - 1 hour to now + 24 hours?
    // Let's just pass all compatible events.
    // However, the timeline logic relies on calculating positions relative to 'timelineStart'.
    // We should allow events starting before timelineStart if they end after it.

    // Update time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)
        return () => clearInterval(interval)
    }, [])

    const resetScroll = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        }
    }

    const getTimelineStart = (date: Date) => {
        const ms = 1000 * 60 * 5
        return new Date(Math.floor(date.getTime() / ms) * ms)
    }

    const timelineStart = getTimelineStart(currentTime)
    const timelineEnd = new Date(timelineStart.getTime() + 24 * 60 * 60 * 1000)

    const timeSlots = []
    for (let i = 0; i < 288; i++) {
        timeSlots.push(new Date(timelineStart.getTime() + i * 5 * 60000))
    }

    // Filter and Process events
    const layoutEvents = (() => {
        // Filter events that overlap with the timeline window
        const relevantEvents = events.filter(e => {
            const start = new Date(e.startTime)
            const end = new Date(start.getTime() + e.durationMinutes * 60000)
            return end > timelineStart && start < timelineEnd
        })

        const rowEndTimes = [0, 0]
        return relevantEvents.map(event => {
            const startObj = new Date(event.startTime)
            const start = startObj.getTime()
            const end = start + event.durationMinutes * 60000

            let rowIndex = 0
            if (start >= rowEndTimes[0]) {
                rowIndex = 0
                rowEndTimes[0] = end
            } else {
                rowIndex = 1
                if (start >= rowEndTimes[1]) {
                    rowEndTimes[1] = end
                } else {
                    rowEndTimes[1] = Math.max(rowEndTimes[1], end)
                }
            }
            return { ...event, rowIndex, startTime: startObj } // Normalize startTime to Date object just in case
        })
    })()

    return (
        <div className="w-full bg-card/50 border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-xl flex items-center gap-2">
                    Now Playing & Upcoming
                    <span className="text-primary font-bold text-lg hidden sm:inline border-l border-border pl-2">
                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </h3>
                <div className="ml-auto flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:inline-block">
                        Local Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                        onClick={resetScroll}
                        className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-md transition-colors font-bold"
                    >
                        Back to Now
                    </button>
                </div>
            </div>

            <div className="relative w-full overflow-x-auto p-6 scrollbar-hide" ref={scrollContainerRef}>
                <div className="min-w-[7200px] relative">
                    <div className="flex absolute inset-0 pointer-events-none h-full">
                        {timeSlots.map((slot, i) => {
                            const isHalfHour = i % 6 === 0;
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "shrink-0 border-l h-full flex flex-col justify-end pb-2",
                                        isHalfHour ? "border-border/40 w-[25px]" : "border-border/10 w-[25px]"
                                    )}
                                >
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex border-b border-border/50 pb-2 mb-4 relative z-10">
                        {timeSlots.map((slot, i) => {
                            const isHalfHour = i % 6 === 0;
                            return (
                                <div key={i} className="w-[25px] shrink-0 text-xs text-muted-foreground/70 font-mono pl-1">
                                    {isHalfHour && (
                                        <span className="-ml-1">{slot.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="relative h-40 z-10">
                        <div className="absolute top-0 bottom-0 border-l-2 border-red-500 z-20" style={{ left: '0px' }}>
                            <div className="absolute -top-1 -left-[3px] w-2 h-2 bg-red-500 rounded-full" />
                        </div>

                        {layoutEvents.map(event => {
                            const diffMs = event.startTime.getTime() - timelineStart.getTime()
                            const diffMinutes = diffMs / 60000
                            const leftPos = diffMinutes * 5
                            const width = event.durationMinutes * 5

                            if (leftPos + width < 0) return null

                            const topPos = event.rowIndex === 0 ? 8 : 80;

                            return (
                                <div
                                    key={event.id}
                                    onClick={() => onEventClick(event as any)}
                                    className={cn(
                                        "absolute h-16 rounded-lg p-3 text-sm border shadow-sm transition-transform hover:scale-105 cursor-pointer overflow-hidden backdrop-blur-sm",
                                        event.type === 'GAME' ? "bg-blue-500/10 border-blue-500/30 text-blue-500" :
                                            event.type === 'COMPETITION' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                                                event.type === 'SOCIAL' ? "bg-pink-500/10 border-pink-500/30 text-pink-500" :
                                                    "bg-slate-500/10 border-slate-500/30 text-slate-500"
                                    )}
                                    style={{
                                        left: `${leftPos}px`,
                                        width: `${width - 2}px`,
                                        top: `${topPos}px`
                                    }}
                                >
                                    <div className="font-bold truncate">{event.title}</div>
                                    <div className="text-xs opacity-80 truncate">
                                        {event.startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {event.durationMinutes}m
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="p-3 bg-muted/10 text-xs text-center text-muted-foreground border-t border-border">
                Schedule updates automatically every 5 minutes • Scroll right to see next 24 hours
            </div>
        </div>
    )
}

function WeeklyCalendar({ events, onEventClick }: { events: Event[], onEventClick: (event: Event) => void }) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    start.setHours(0, 0, 0, 0)
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    // Filter events for this week
    const weeklyEvents = events.filter(e => {
        const t = new Date(e.startTime)
        return t >= start && t < end
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    // Limit to top 5-6 to avoid overflow? or scroll. The container has scroll.

    // We want to group by day or just list them? 
    // The previous design listed them.

    // Helper to format day name
    const getDayName = (d: Date) => d.toLocaleDateString([], { weekday: 'long' })

    const formatDate = (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
        <div className="bg-card/50 border border-border rounded-xl p-6 h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-6 shrink-0">
                <CalendarDays className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-heading font-bold flex flex-col sm:flex-row sm:items-baseline gap-2">
                    This Week <span className="text-primary font-bold text-xl block sm:inline">({formatDate(start)} - {formatDate(end)})</span>
                </h3>
            </div>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {weeklyEvents.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 italic">No events scheduled this week.</div>
                ) : (
                    weeklyEvents.map((evt, i) => (
                        <div
                            key={evt.id}
                            onClick={() => onEventClick(evt)}
                            className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer group"
                        >
                            <div className="w-16 shrink-0 text-center font-bold text-muted-foreground/80 leading-tight">
                                <span className="block text-xs uppercase tracking-wider">{getDayName(new Date(evt.startTime)).substring(0, 3)}</span>
                            </div>
                            <div className="w-px h-8 bg-border" />
                            <div>
                                <div className="font-bold">{evt.title}</div>
                                <div className="text-xs text-primary">
                                    {new Date(evt.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

function MonthlyCalendar({ events, onEventClick }: { events: Event[], onEventClick: (event: Event) => void }) {
    const today = new Date();
    // Default to current month viewing
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);

    const monthEvents = events.filter(e => {
        const t = new Date(e.startTime)
        return t >= startOfMonth && t <= endOfMonth
    });

    // Smart Filter: "Highlights Only"
    // Rule: events that happen once a month, are monthly, or are a one time thing, not weekly, daily
    // Heuristic: If a seriesId appears > 1 time in this month, exclude it.
    const seriesCounts = new Map<string, number>();
    monthEvents.forEach(e => {
        if (e.seriesId) {
            seriesCounts.set(e.seriesId, (seriesCounts.get(e.seriesId) || 0) + 1);
        }
    });

    const highlightEvents = monthEvents.filter(e => {
        if (!e.seriesId) return true; // One-time event -> Include
        return seriesCounts.get(e.seriesId) === 1; // Only appears once this month -> Include
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return (
        <div className="bg-card/50 border border-border rounded-xl p-6 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-heading font-bold flex gap-2">
                        Highlights <span className="text-muted-foreground font-normal text-lg hidden sm:inline">| {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    </h3>
                </div>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-muted rounded"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={nextMonth} className="p-1 hover:bg-muted rounded"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {highlightEvents.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 italic">No major highlights this month.</div>
                ) : (
                    highlightEvents.map((evt, i) => (
                        <div
                            key={evt.id}
                            onClick={() => onEventClick(evt)}
                            className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-background/50 to-transparent border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
                        >
                            <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 text-xs text-center leading-none">
                                {new Date(evt.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' }).split(" ").map((x, ii) => <span key={ii} className="block">{x}</span>)}
                            </div>
                            <div>
                                <div className="font-bold">{evt.title}</div>
                                <div className="text-xs text-muted-foreground capitalize">{evt.type.toLowerCase()} Event</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

function isSameDay(d1: Date, d2: Date) {
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
}
