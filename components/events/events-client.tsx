"use client"

import { useState, useEffect } from "react"
import { Event, EventType, Role } from "@prisma/client"
import { motion, AnimatePresence } from "framer-motion"
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { createEvent, deleteEvent, deleteEventSeries } from "@/app/actions/events"
import { Badge } from "@/components/ui/badge"
import { PillowCard } from "@/components/ui/pillow-card"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface EventsClientProps {
    initialEvents: Event[]
    eventTemplates: any[] // We can use EventInfo[] once types are stable
    userRole?: Role
}

type ViewMode = 'daily' | 'weekly' | 'monthly'

export interface EventInfo {
    title: string;
    description: string;
    image: string;
    shadowColor: string;
    hoverColor: string;
    howTo: string[];
    rules: string[];
}

export function EventsClient({ initialEvents, eventTemplates, userRole }: EventsClientProps) {
    const [events, setEvents] = useState<Event[]>(initialEvents)
    const [templates, setTemplates] = useState<any[]>(eventTemplates)
    const [viewMode, setViewMode] = useState<ViewMode>('weekly')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, event: Event | null }>({ isOpen: false, event: null })
    const [selectedInfo, setSelectedInfo] = useState<EventInfo | null>(null)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const router = useRouter()

    useEffect(() => {
        setEvents(initialEvents)
    }, [initialEvents])

    useEffect(() => {
        setTemplates(eventTemplates)
    }, [eventTemplates])

    const isAdmin = userRole === "ADMIN"

    // --- Date Navigation ---
    const nextPeriod = () => {
        if (viewMode === 'daily') setCurrentDate(addDays(currentDate, 1))
        if (viewMode === 'weekly') setCurrentDate(addDays(currentDate, 7))
        if (viewMode === 'monthly') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const prevPeriod = () => {
        if (viewMode === 'daily') setCurrentDate(addDays(currentDate, -1))
        if (viewMode === 'weekly') setCurrentDate(addDays(currentDate, -7))
        if (viewMode === 'monthly') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const resetDate = () => setCurrentDate(new Date())

    // --- Event Handling ---
    const handleDeleteClick = (event: Event) => {
        setDeleteConfirmation({ isOpen: true, event })
    }

    const confirmDelete = async (deleteSeries: boolean) => {
        const event = deleteConfirmation.event
        if (!event) return

        if (deleteSeries && (event as any).seriesId) {
            const res = await deleteEventSeries((event as any).seriesId)
            if (res.success) router.refresh()
        } else {
            const res = await deleteEvent(event.id)
            if (res.success) router.refresh()
        }
        setDeleteConfirmation({ isOpen: false, event: null })
    }

    const matchingInfo = selectedEvent ? templates.find(info =>
        selectedEvent.title.toLowerCase().includes(info.title.toLowerCase().split(' ')[0]) ||
        info.title.toLowerCase().includes(selectedEvent.title.toLowerCase())
    ) : null

    return (
        <div className="space-y-8">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/50 p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex bg-muted/50 rounded-lg p-1">
                        {(['daily', 'weekly', 'monthly'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-all capitalize",
                                    viewMode === mode ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <div className="h-8 w-px bg-border mx-2 hidden md:block" />
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={prevPeriod}><ChevronLeft className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={resetDate} className="font-heading">
                            {viewMode === 'daily' && format(currentDate, 'MMM d, yyyy')}
                            {viewMode === 'weekly' && `Week of ${format(startOfWeek(currentDate), 'MMM d')}`}
                            {viewMode === 'monthly' && format(currentDate, 'MMMM yyyy')}
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextPeriod}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex gap-2">
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" /> Add Event
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Event</DialogTitle>
                                </DialogHeader>
                                <AddEventForm
                                    templates={templates}
                                    onSuccess={(newEvent) => {
                                        setIsAddModalOpen(false)
                                        router.refresh()
                                    }}
                                />
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <CalendarIcon className="w-4 h-4" /> Manage Guides
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Manage Rules & Guides</DialogTitle>
                                    <DialogDescription>Create and edit the templates used for event rules and official guides.</DialogDescription>
                                </DialogHeader>
                                <ManageTemplatesForm
                                    templates={templates}
                                    onSuccess={() => {
                                        router.refresh()
                                    }}
                                />
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
                                    <Trash2 className="w-4 h-4" /> Delete Event
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Manage Future Events</DialogTitle>
                                    <DialogDescription>
                                        A complete list of all upcoming events. Click the trash icon to remove an event.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar mt-4">
                                    <FutureEventsList
                                        events={events}
                                        onDelete={(event) => {
                                            handleDeleteClick(event)
                                        }}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => !open && setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Event</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-muted-foreground mb-4">
                            Are you sure you want to delete <span className="font-bold text-foreground">"{deleteConfirmation.event?.title}"</span>?
                        </p>
                        {(deleteConfirmation.event as any)?.seriesId && (
                            <div className="bg-muted/50 p-3 rounded-md border border-border text-sm mb-4">
                                <strong className="block mb-1">Repeating Series</strong>
                                This event is part of a recurring series. You can choose to delete only this specific occurrence or the entire future schedule.
                            </div>
                        )}
                        <div className="flex flex-col gap-2 mt-4">
                            {(deleteConfirmation.event as any)?.seriesId ? (
                                <>
                                    <Button className="bg-red-600 hover:bg-red-700 text-white border-transparent" onClick={() => confirmDelete(true)}>
                                        Delete Entire Series (All Future Events)
                                    </Button>
                                    <Button className="bg-red-100 hover:bg-red-200 text-red-900 border-transparent" onClick={() => confirmDelete(false)}>
                                        Delete Only This Event
                                    </Button>
                                </>
                            ) : (
                                <Button className="bg-red-600 hover:bg-red-700 text-white border-transparent" onClick={() => confirmDelete(false)}>
                                    Yes, Delete Event
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setDeleteConfirmation({ isOpen: false, event: null })}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Calendar View */}
            <div className="bg-card/30 border border-border rounded-xl min-h-[600px] shadow-sm backdrop-blur-sm relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={viewMode + currentDate.toISOString()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {viewMode === 'monthly' && <MonthlyView currentDate={currentDate} events={events} onEventClick={setSelectedEvent} onDelete={isAdmin ? handleDeleteClick : undefined} />}
                        {viewMode === 'weekly' && <WeeklyView currentDate={currentDate} events={events} onEventClick={setSelectedEvent} onDelete={isAdmin ? handleDeleteClick : undefined} />}
                        {viewMode === 'daily' && <DailyView currentDate={currentDate} events={events} onEventClick={setSelectedEvent} onDelete={isAdmin ? handleDeleteClick : undefined} />}
                    </motion.div>
                </AnimatePresence>
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
                                {selectedEvent && format(new Date(selectedEvent.startTime), 'EEEE, MMMM do, yyyy')}
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
                            <span className="font-mono text-sm">
                                {selectedEvent && format(new Date(selectedEvent.startTime), 'h:mm a')}
                            </span>
                        </div>
                        <div className="flex flex-col bg-muted/30 p-3 rounded-lg border border-border/50">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase mb-1">
                                <CalendarIcon className="w-3 h-3" /> Duration
                            </div>
                            <span className="font-mono text-sm">{selectedEvent?.durationMinutes} minutes</span>
                        </div>
                        {/* Series Info */}
                        <div className="flex flex-col bg-muted/30 p-3 rounded-lg col-span-2 border border-border/50">
                            <span className="text-xs text-muted-foreground font-bold uppercase mb-1">Recurrence</span>
                            <span className="font-medium text-sm">
                                {selectedEvent?.seriesId ? "This event is part of a recurring series." : "One-time Event"}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        {matchingInfo && (
                            <Button
                                variant="premium"
                                className="w-full flex items-center justify-center gap-2 h-12 shadow-md animate-pulse hover:animate-none"
                                onClick={() => {
                                    setSelectedEvent(null)
                                    setSelectedInfo(matchingInfo)
                                }}
                            >
                                View Rules & Official Guide
                            </Button>
                        )}

                        {isAdmin && selectedEvent && (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full h-11"
                                onClick={() => {
                                    setSelectedEvent(null)
                                    handleDeleteClick(selectedEvent)
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Event
                            </Button>
                        )}
                        <Button variant="outline" className="w-full h-11" onClick={() => setSelectedEvent(null)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Event Type Information Section */}
            <div className="pt-20 space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <h2 className="text-4xl font-heading font-bold gradient-text">Popular Events</h2>
                    <p className="text-muted-foreground">Click on any event type below to learn how to play and view the official rules.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 pb-12 text-black">
                    {templates.map((info) => (
                        <PillowCard
                            key={info.title}
                            className="h-[480px] cursor-pointer group"
                            shadowClassName={info.shadowColor}
                            contentClassName="flex flex-col p-0"
                            onClick={() => setSelectedInfo(info)}
                        >
                            {/* Top Image & Text Section */}
                            <div className="flex-1 relative overflow-hidden">
                                <img
                                    src={info.image}
                                    alt={info.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-left">
                                    <h3 className="text-3xl font-heading font-bold text-white mb-2 drop-shadow-lg">
                                        {info.title}
                                    </h3>
                                    <p className="text-white/80 text-sm leading-relaxed max-w-[90%] drop-shadow-md">
                                        {info.description}
                                    </p>
                                </div>
                            </div>

                            {/* Highlighting Bottom Area (Shop Style) */}
                            <div className={cn(
                                "h-16 flex items-center justify-center font-heading font-bold text-lg transition-all border-t border-black/5",
                                "bg-white/90 dark:bg-slate-100/90 text-muted-foreground",
                                info.hoverColor,
                                "group-hover:text-white"
                            )}>
                                View Rules & Guide
                            </div>
                        </PillowCard>
                    ))}
                </div>
            </div>

            {/* Event Info Modal */}
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
                                        <h4 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
                                            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">?</span>
                                            How to Play
                                        </h4>
                                        <ul className="space-y-3">
                                            {selectedInfo.howTo.map((step, i) => (
                                                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                                                    <span className="text-primary font-bold">{i + 1}.</span>
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
                                        <h4 className="font-heading font-bold text-xl mb-4 flex items-center gap-2 text-amber-700 dark:text-amber-500">
                                            <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">!</span>
                                            Rules & Conduct
                                        </h4>
                                        <ul className="space-y-3">
                                            {selectedInfo.rules.map((rule, i) => (
                                                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                                                    <span className="text-amber-500 pr-1">•</span>
                                                    {rule}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center mt-4">
                                <Button onClick={() => setSelectedInfo(null)} size="lg" className="px-12">
                                    Got it!
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

// --- View Components ---

// --- View Components ---


function MonthlyView({ currentDate, events, onEventClick, onDelete }: { currentDate: Date, events: Event[], onEventClick: (event: Event) => void, onDelete?: (event: Event) => void }) {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    // Create matrix of days
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="flex flex-col h-full p-4 relative">
            {/* Grid Header */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-sm font-bold text-muted-foreground uppercase tracking-wider py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid Body */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-5 gap-1">
                {calendarDays.map((day, i) => {
                    const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), day))
                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    const isCurrentMonth = isSameMonth(day, monthStart)
                    const isToday = isSameDay(day, new Date())

                    return (
                        <div
                            key={i}
                            className={cn(
                                "bg-card/40 border border-border/40 rounded-lg p-1 min-h-[100px] lg:min-h-[120px] relative flex flex-col transition-colors overflow-hidden",
                                !isCurrentMonth && "bg-muted/10 opacity-60",
                                isToday && "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                            )}
                        >
                            <span className={cn(
                                "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ml-auto",
                                isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                            )}>
                                {format(day, 'd')}
                            </span>

                            <div className="flex flex-col gap-1 w-full overflow-y-auto custom-scrollbar flex-1">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => onEventClick(event)}
                                        className={cn(
                                            "group/event cursor-pointer text-[10px] sm:text-xs px-1.5 py-1 rounded truncate w-full text-left font-medium transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between border shadow-sm",
                                            event.type === 'GAME' ? "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 dark:text-blue-300" :
                                                event.type === 'COMPETITION' ? "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 dark:text-amber-300" :
                                                    event.type === 'SOCIAL' ? "bg-pink-500/10 text-pink-600 border-pink-500/20 hover:bg-pink-500/20 dark:text-pink-300" :
                                                        "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20 dark:text-slate-300"
                                        )}
                                    >
                                        <span className="truncate flex-1">{event.title}</span>
                                        {onDelete && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(event); }}
                                                className="opacity-0 group-hover/event:opacity-100 hover:bg-destructive/10 hover:text-destructive p-0.5 rounded ml-1 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function WeeklyView({ currentDate, events, onEventClick, onDelete }: { currentDate: Date, events: Event[], onEventClick: (event: Event) => void, onDelete?: (event: Event) => void }) {
    const start = startOfWeek(currentDate)
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

    // Timeslots: 00:00 to 24:00? Too long. Let's do a simple vertical stack for now, or a Gantt.
    // Let's do columns for days.
    return (
        <div className="grid grid-cols-7 h-full divide-x divide-border">
            {days.map(day => {
                const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), day)).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                const isToday = isSameDay(day, new Date())

                return (
                    <div key={day.toISOString()} className="flex flex-col h-full bg-card hover:bg-muted/20 transition-colors">
                        <div className={cn("p-3 text-center border-b border-border", isToday && "bg-primary/5")}>
                            <div className="text-xs text-muted-foreground uppercase font-bold">{format(day, 'EEE')}</div>
                            <div className={cn("text-xl font-heading font-bold mt-1 inline-flex w-8 h-8 items-center justify-center rounded-full", isToday && "bg-primary text-primary-foreground")}>
                                {format(day, 'd')}
                            </div>
                        </div>
                        <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                            {dayEvents.map(event => (
                                <div
                                    key={event.id}
                                    className="p-2 rounded-lg bg-background border border-border/60 shadow-sm relative group cursor-pointer hover:border-primary/40 transition-colors"
                                    onClick={() => onEventClick(event)}
                                >
                                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(event.startTime), 'h:mm a')}
                                    </div>
                                    <div className="font-bold text-sm leading-tight text-primary">{event.title}</div>
                                    <div className="text-[10px] text-muted-foreground mt-1 capitalize">{event.type}</div>

                                    {onDelete && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(event); }}
                                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {dayEvents.length === 0 && (
                                <div className="h-full flex items-center justify-center text-muted-foreground/30 text-sm italic">
                                    No events
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function DailyView({ currentDate, events, onEventClick, onDelete }: { currentDate: Date, events: Event[], onEventClick: (event: Event) => void, onDelete?: (event: Event) => void }) {
    const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), currentDate)).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    return (
        <div className="max-w-3xl mx-auto p-8 h-full overflow-y-auto">
            <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-primary" />
                {format(currentDate, 'EEEE, MMMM do, yyyy')}
            </h2>

            <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
                {dayEvents.map(event => (
                    <div key={event.id} className="relative pl-10 group">
                        {/* Timeline Dot */}
                        <div className="absolute left-[13px] top-6 w-2 h-2 rounded-full bg-primary ring-4 ring-background z-10" />

                        <div
                            className="bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30"
                            onClick={() => onEventClick(event)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                                        {format(new Date(event.startTime), 'h:mm a')}
                                        <span className="text-muted-foreground font-normal">• {event.durationMinutes} mins</span>
                                    </div>
                                    <h3 className="text-lg font-bold">{event.title}</h3>
                                    {event.description && <p className="text-muted-foreground mt-2 text-sm">{event.description}</p>}
                                    <div className="mt-3 inline-flex items-center px-2 py-1 rounded-full bg-muted text-xs font-medium capitalize">
                                        {event.type}
                                    </div>
                                </div>
                                {onDelete && (
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(event); }} className="text-muted-foreground hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {dayEvents.length === 0 && (
                    <div className="pl-10 text-muted-foreground italic py-8">
                        No events scheduled for today.
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Hardcoded Info Data (Removed as it is now in DB) ---


import { RecurrenceType, updateEventTypeInfo } from "@/app/actions/events"

function AddEventForm({ templates, onSuccess }: { templates: any[], onSuccess: (event: Event | any) => void }) {
    const [title, setTitle] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [time, setTime] = useState("")
    const [duration, setDuration] = useState("60")
    const [type, setType] = useState<EventType>("GAME")
    const [selectedTemplateTitle, setSelectedTemplateTitle] = useState("")

    // Recurrence State
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('NONE')
    const [recurrenceEndDate, setRecurrenceEndDate] = useState("")
    const [isIndefinite, setIsIndefinite] = useState(false)
    const [customDays, setCustomDays] = useState<number[]>([]) // 0-6

    const [loading, setLoading] = useState(false)

    // Auto-fill from template
    useEffect(() => {
        if (selectedTemplateTitle && selectedTemplateTitle !== "CUSTOM") {
            const template = templates.find(t => t.title === selectedTemplateTitle)
            if (template) {
                setTitle(template.title)
            }
        }
    }, [selectedTemplateTitle, templates])

    const toggleDay = (day: number) => {
        if (customDays.includes(day)) {
            setCustomDays(customDays.filter(d => d !== day))
        } else {
            setCustomDays([...customDays, day])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const startTime = new Date(`${date}T${time}`)
            let recurrence = undefined

            if (recurrenceType !== 'NONE') {
                if (!isIndefinite && !recurrenceEndDate) {
                    alert("Please select an end date for the recurrence.")
                    setLoading(false)
                    return
                }
                recurrence = {
                    type: recurrenceType,
                    endDate: isIndefinite ? undefined : new Date(recurrenceEndDate),
                    daysOfWeek: recurrenceType === 'CUSTOM' ? customDays : undefined
                }
            }

            const res = await createEvent({
                title,
                startTime,
                durationMinutes: parseInt(duration),
                type,
                recurrence
            })
            if (res.success) {
                onSuccess({} as Event)
            } else {
                alert("Error: " + res.error)
            }
        } finally {
            setLoading(false)
        }
    }

    const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
                <label className="text-sm font-medium">Use Template</label>
                <select
                    className="w-full bg-background border px-3 py-2 rounded-md"
                    value={selectedTemplateTitle}
                    onChange={e => setSelectedTemplateTitle(e.target.value)}
                >
                    <option value="">-- Select a Game Guide --</option>
                    {templates.map(t => (
                        <option key={t.id} value={t.title}>{t.title}</option>
                    ))}
                    <option value="CUSTOM">Custom / Manual Entry</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Event Title</label>
                <input className="w-full bg-background border px-3 py-2 rounded-md" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Spleef Tournament" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <input type="date" className="w-full bg-background border px-3 py-2 rounded-md" required value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <input type="time" className="w-full bg-background border px-3 py-2 rounded-md" required value={time} onChange={e => setTime(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (mins)</label>
                    <input type="number" className="w-full bg-background border px-3 py-2 rounded-md" required value={duration} onChange={e => setDuration(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select className="w-full bg-background border px-3 py-2 rounded-md" value={type} onChange={e => setType(e.target.value as any)}>
                        {['GAME', 'SOCIAL', 'MAINTENANCE', 'COMPETITION', 'SPECIAL'].map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
                <div className="grid grid-cols-2 gap-4 items-start">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Repeats</label>
                        <select className="w-full bg-background border px-3 py-2 rounded-md" value={recurrenceType} onChange={e => setRecurrenceType(e.target.value as RecurrenceType)}>
                            <option value="NONE">Does not repeat</option>
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="CUSTOM">Custom Days</option>
                        </select>
                        {recurrenceType !== 'NONE' && (
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="indefinite"
                                    className="accent-primary"
                                    onChange={(e) => setIsIndefinite(e.target.checked)}
                                    checked={isIndefinite}
                                />
                                <label htmlFor="indefinite" className="text-xs text-muted-foreground select-none cursor-pointer">Repeat indefinitely</label>
                            </div>
                        )}
                    </div>
                    {recurrenceType !== 'NONE' && (
                        <div className="space-y-2">
                            <label className={cn("text-sm font-medium", isIndefinite && "opacity-50")}>Until</label>
                            <input
                                type="date"
                                className="w-full bg-background border px-3 py-2 rounded-md"
                                disabled={isIndefinite}
                                required={!isIndefinite}
                                value={recurrenceEndDate}
                                onChange={e => setRecurrenceEndDate(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {recurrenceType === 'CUSTOM' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Repeat On</label>
                        <div className="flex gap-2">
                            {weekDayLabels.map((day, i) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(i)}
                                    className={cn(
                                        "w-8 h-8 rounded-full text-xs font-bold transition-colors border",
                                        customDays.includes(i) ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted border-border"
                                    )}
                                >
                                    {day[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Creating..." : "Create Event(s)"}
            </Button>
        </form>
    )
}

const COLOR_PRESETS = [
    { name: "Blue", shadow: "bg-blue-400/30", hover: "group-hover:bg-blue-500", swatch: "bg-blue-500", hoverClass: "hover:bg-blue-500" },
    { name: "Purple", shadow: "bg-purple-400/30", hover: "group-hover:bg-purple-500", swatch: "bg-purple-500", hoverClass: "hover:bg-purple-500" },
    { name: "Pink", shadow: "bg-pink-400/30", hover: "group-hover:bg-pink-500", swatch: "bg-pink-500", hoverClass: "hover:bg-pink-500" },
    { name: "Amber", shadow: "bg-amber-400/30", hover: "group-hover:bg-amber-500", swatch: "bg-amber-500", hoverClass: "hover:bg-amber-500" },
    { name: "Emerald", shadow: "bg-emerald-400/30", hover: "group-hover:bg-emerald-500", swatch: "bg-emerald-500", hoverClass: "hover:bg-emerald-500" },
    { name: "Red", shadow: "bg-red-400/30", hover: "group-hover:bg-red-500", swatch: "bg-red-500", hoverClass: "hover:bg-red-500" },
    { name: "Slate", shadow: "bg-slate-400/30", hover: "group-hover:bg-slate-500", swatch: "bg-slate-500", hoverClass: "hover:bg-slate-500" },
]

function ManageTemplatesForm({ templates, onSuccess }: { templates: any[], onSuccess: () => void }) {
    const [selectedId, setSelectedId] = useState<string>("")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [shadowColor, setShadowColor] = useState(COLOR_PRESETS[0].shadow)
    const [hoverColor, setHoverColor] = useState(COLOR_PRESETS[0].hover)
    const [howTo, setHowTo] = useState<string[]>([""])
    const [rules, setRules] = useState<string[]>([""])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedId && selectedId !== "NEW") {
            const t = templates.find(temp => temp.id === selectedId)
            if (t) {
                setTitle(t.title)
                setDescription(t.description)
                setImage(t.image)
                setShadowColor(t.shadowColor)
                setHoverColor(t.hoverColor)
                setHowTo(t.howTo.length > 0 ? t.howTo : [""])
                setRules(t.rules.length > 0 ? t.rules : [""])
            }
        } else {
            setTitle("")
            setDescription("")
            setImage("")
            setShadowColor(COLOR_PRESETS[0].shadow)
            setHoverColor(COLOR_PRESETS[0].hover)
            setHowTo([""])
            setRules([""])
        }
    }, [selectedId, templates])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await updateEventTypeInfo({
                title,
                description,
                image,
                shadowColor,
                hoverColor,
                howTo: howTo.filter(s => s.trim() !== ""),
                rules: rules.filter(r => r.trim() !== "")
            })
            if (res.success) {
                onSuccess()
                setSelectedId("")
            } else {
                alert("Error: " + res.error)
            }
        } finally {
            setLoading(false)
        }
    }

    const updateItem = (list: string[], setList: (L: string[]) => void, index: number, val: string) => {
        const newList = [...list]
        newList[index] = val
        setList(newList)
    }

    const addItem = (list: string[], setList: (L: string[]) => void) => setList([...list, ""])
    const removeItem = (list: string[], setList: (L: string[]) => void, index: number) => {
        if (list.length > 1) {
            setList(list.filter((_, i) => i !== index))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-4 text-black">
            <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Template to Edit</label>
                <select className="w-full bg-background border px-3 py-2 rounded-md" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                    <option value="">-- Choose existing or create new --</option>
                    <option value="NEW">+ Create New Guide</option>
                    {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                </select>
            </div>

            {selectedId && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <input className="w-full bg-background border px-3 py-2 rounded-md text-black" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Spleef Arena" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea className="w-full bg-background border px-3 py-2 rounded-md min-h-[80px] text-black" required value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Image URL (Blob Storage or /images/...)</label>
                        <input className="w-full bg-background border px-3 py-2 rounded-md text-black" required value={image} onChange={e => setImage(e.target.value)} placeholder="https://... or /images/events/spleef.png" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Theme Color</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {COLOR_PRESETS.map((preset) => (
                                <button
                                    key={preset.name}
                                    type="button"
                                    onClick={() => {
                                        setShadowColor(preset.shadow)
                                        setHoverColor(preset.hover)
                                    }}
                                    className={cn(
                                        "flex items-center gap-2 p-2 rounded-lg border transition-all text-sm font-medium group",
                                        shadowColor === preset.shadow
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-border hover:text-white",
                                        preset.hoverClass
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full shadow-sm transition-colors",
                                        preset.swatch,
                                        "group-hover:bg-white"
                                    )} />
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold flex justify-between items-center">
                            How to Play Steps
                            <Button type="button" variant="ghost" size="sm" onClick={() => addItem(howTo, setHowTo)} className="h-7 text-xs">+ Add</Button>
                        </label>
                        {howTo.map((step, i) => (
                            <div key={i} className="flex gap-2">
                                <input className="flex-1 bg-background border px-3 py-1.5 rounded-md text-sm text-black" value={step} onChange={e => updateItem(howTo, setHowTo, i, e.target.value)} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(howTo, setHowTo, i)} className="text-destructive h-8 w-8"><Trash2 className="w-3 h-3" /></Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold flex justify-between items-center">
                            Rules & Conduct
                            <Button type="button" variant="ghost" size="sm" onClick={() => addItem(rules, setRules)} className="h-7 text-xs">+ Add</Button>
                        </label>
                        {rules.map((rule, i) => (
                            <div key={i} className="flex gap-2">
                                <input className="flex-1 bg-background border px-3 py-1.5 rounded-md text-sm text-black" value={rule} onChange={e => updateItem(rules, setRules, i, e.target.value)} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(rules, setRules, i)} className="text-destructive h-8 w-8"><Trash2 className="w-3 h-3" /></Button>
                            </div>
                        ))}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Saving..." : "Save Template"}
                    </Button>
                </div>
            )}
        </form>
    )
}

function FutureEventsList({ events, onDelete }: { events: Event[], onDelete: (event: Event) => void }) {
    const futureEvents = events
        .filter(e => new Date(e.startTime) >= new Date())
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    if (futureEvents.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground italic">
                No future events found in the schedule.
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {futureEvents.map(event => (
                <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/30 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/20 shrink-0">
                            <span className="text-[10px] uppercase font-bold">{format(new Date(event.startTime), 'MMM')}</span>
                            <span className="text-lg font-bold leading-none">{format(new Date(event.startTime), 'd')}</span>
                        </div>
                        <div>
                            <div className="font-bold text-sm">{event.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>{format(new Date(event.startTime), 'h:mm a')}</span>
                                <span>•</span>
                                <span className="capitalize">{event.type.toLowerCase()}</span>
                                {event.seriesId && (
                                    <>
                                        <span>•</span>
                                        <span className="text-primary/70">Recurring</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(event)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ))}
        </div>
    )
}
