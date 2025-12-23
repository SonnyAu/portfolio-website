"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Mail, CheckCircle, Clock, User, Send, ChevronDown, Users, Briefcase, Plus, Trash2, X } from "lucide-react";

type Role = "hr" | "intern";

interface Task {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed";
  assignedBy?: string;
  dueDate?: string;
}

interface Intern {
  id: string;
  name: string;
  email: string;
  tasks: Task[];
}

const emailTemplates = [
  { id: "onboarding", label: "Onboarding Welcome", icon: "👋" },
  { id: "offboarding", label: "Offboarding Process", icon: "👋" },
  { id: "task-assigned", label: "Task Assigned", icon: "📋" },
  { id: "reminder", label: "Task Reminder", icon: "⏰" },
  { id: "feedback", label: "Performance Feedback", icon: "💬" },
];

export default function HRDashboardDemo() {
  const [role, setRole] = useState<Role>("hr");
  const [interns, setInterns] = useState<Intern[]>([
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah.chen@skyit.com",
      tasks: [
        { id: "t1", title: "Complete onboarding documentation", status: "completed" },
        { id: "t2", title: "Attend team standup meeting", status: "in-progress" },
        { id: "t3", title: "Review API documentation", status: "pending" },
      ],
    },
    {
      id: "2",
      name: "Alex Rodriguez",
      email: "alex.r@skyit.com",
      tasks: [
        { id: "t4", title: "Set up development environment", status: "completed" },
        { id: "t5", title: "Complete first coding task", status: "in-progress" },
      ],
    },
  ]);
  const [selectedIntern, setSelectedIntern] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);
  const [viewingTasks, setViewingTasks] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskIdCounter, setTaskIdCounter] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [role]);

  const handleSendEmail = () => {
    if (selectedIntern && selectedTemplate) {
      setEmailSent(true);
      setTimeout(() => {
        setEmailSent(false);
        setSelectedTemplate("");
      }, 2000);
    }
  };

  const handleAddTask = (internId: string) => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: `t${taskIdCounter}`,
      title: newTaskTitle,
      status: "pending",
      assignedBy: role === "hr" ? "HR Manager" : undefined,
    };

    setInterns((prev) =>
      prev.map((intern) =>
        intern.id === internId
          ? { ...intern, tasks: [...intern.tasks, newTask] }
          : intern
      )
    );
    
    setNewTaskTitle("");
    setShowNewTaskForm(false);
    setTaskIdCounter((prev) => prev + 1);
  };

  const handleDeleteTask = (internId: string, taskId: string) => {
    setInterns((prev) =>
      prev.map((intern) =>
        intern.id === internId
          ? { ...intern, tasks: intern.tasks.filter((t) => t.id !== taskId) }
          : intern
      )
    );
  };

  const handleUpdateTaskStatus = (internId: string, taskId: string, newStatus: Task["status"]) => {
    setInterns((prev) =>
      prev.map((intern) =>
        intern.id === internId
          ? {
              ...intern,
              tasks: intern.tasks.map((t) =>
                t.id === taskId ? { ...t, status: newStatus } : t
              ),
            }
          : intern
      )
    );
  };

  const currentIntern = interns.find((i) => i.id === selectedIntern);
  const internViewIntern = role === "intern" ? interns[0] : null; // For intern view, show first intern's tasks
  const isHR = role === "hr";

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto bg-[#0f0f0f] border border-neutral-800 rounded-lg p-4 md:p-6">
      {/* Role Switcher */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Briefcase className="text-[#00D2BE]" size={16} />
          <span className="text-xs md:text-sm font-f1-bold text-neutral-300">VIEW AS:</span>
        </div>
        <div className="flex gap-2 bg-neutral-900 rounded-lg p-1">
          <button
            onClick={() => {
              setRole("hr");
              setSelectedIntern(null);
              setViewingTasks(false);
            }}
            className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-f1-bold rounded transition-all duration-300 ${
              isHR
                ? "bg-[#00D2BE] text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            HR Manager
          </button>
          <button
            onClick={() => {
              setRole("intern");
              setSelectedIntern("1");
              setViewingTasks(true);
            }}
            className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-f1-bold rounded transition-all duration-300 ${
              !isHR
                ? "bg-[#00D2BE] text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Intern
          </button>
        </div>
      </div>

      {isHR ? (
        /* HR Manager View */
        <div className="space-y-4">
          <div>
            <h3 className="text-sm md:text-base font-f1-bold text-[#00D2BE] mb-3 flex items-center gap-2">
              <Users size={16} />
              Intern Management
            </h3>
            <div className="space-y-2">
              {interns.map((intern) => (
                <div
                  key={intern.id}
                  className={`p-3 md:p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                    selectedIntern === intern.id
                      ? "border-[#00D2BE] bg-neutral-900/50"
                      : "border-neutral-800 hover:border-neutral-700"
                  }`}
                  onClick={() => {
                    setSelectedIntern(intern.id);
                    setSelectedTemplate("");
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[#00D2BE]" />
                      <span className="text-xs md:text-sm font-f1-bold text-white">{intern.name}</span>
                    </div>
                    <span className="text-xs text-neutral-400 font-f1">{intern.email}</span>
                  </div>

                  {selectedIntern === intern.id && (
                    <div className="mt-3 pt-3 border-t border-neutral-800 space-y-3">
                      {/* Email Template Selector */}
                      <div>
                        <label className="text-xs font-f1-bold text-neutral-300 mb-2 block">
                          Select Email Template:
                        </label>
                        <div className="relative">
                          <select
                            value={selectedTemplate}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedTemplate(e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-xs md:text-sm text-white font-f1 focus:border-[#00D2BE] focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="">Choose template...</option>
                            {emailTemplates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.icon} {template.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                          />
                        </div>
                      </div>

                      {/* Send Email Button */}
                      {selectedTemplate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendEmail();
                          }}
                          disabled={emailSent}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-f1-bold text-xs md:text-sm transition-all duration-300 ${
                            emailSent
                              ? "bg-green-600 text-white cursor-not-allowed"
                              : "bg-[#00D2BE] text-black hover:bg-[#00A896]"
                          }`}
                        >
                          {emailSent ? (
                            <>
                              <CheckCircle size={14} />
                              Email Sent!
                            </>
                          ) : (
                            <>
                              <Send size={14} />
                              Send Email
                            </>
                          )}
                        </button>
                      )}

                      {/* Task Management */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-f1-bold text-neutral-300">Tasks</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingTasks(!viewingTasks);
                              setShowNewTaskForm(false);
                            }}
                            className="text-xs text-[#00D2BE] hover:text-white font-f1 transition-colors"
                          >
                            {viewingTasks ? "Hide" : "View/Assign"}
                          </button>
                        </div>
                        {viewingTasks && (
                          <div className="space-y-2 mt-2">
                            {intern.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between gap-2 p-2 bg-neutral-900 rounded border border-neutral-800 group"
                              >
                                <span className="text-xs text-neutral-300 font-f1 flex-1">
                                  {task.title}
                                </span>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={task.status}
                                    onChange={(e) =>
                                      handleUpdateTaskStatus(
                                        intern.id,
                                        task.id,
                                        e.target.value as Task["status"]
                                      )
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs px-2 py-0.5 rounded font-f1-bold bg-neutral-800 border border-neutral-700 text-white focus:border-[#00D2BE] focus:outline-none cursor-pointer"
                                  >
                                    <option value="pending">pending</option>
                                    <option value="in-progress">in-progress</option>
                                    <option value="completed">completed</option>
                                  </select>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTask(intern.id, task.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {showNewTaskForm ? (
                              <div className="p-2 bg-neutral-900 rounded border border-[#00D2BE]">
                                <input
                                  type="text"
                                  value={newTaskTitle}
                                  onChange={(e) => setNewTaskTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleAddTask(intern.id);
                                    } else if (e.key === "Escape") {
                                      setShowNewTaskForm(false);
                                      setNewTaskTitle("");
                                    }
                                  }}
                                  placeholder="Enter task title..."
                                  autoFocus
                                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white font-f1 focus:border-[#00D2BE] focus:outline-none mb-2"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddTask(intern.id);
                                    }}
                                    className="flex-1 px-2 py-1 bg-[#00D2BE] text-black text-xs font-f1-bold rounded hover:bg-[#00A896] transition-colors"
                                  >
                                    Add
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowNewTaskForm(false);
                                      setNewTaskTitle("");
                                    }}
                                    className="px-2 py-1 bg-neutral-800 text-neutral-400 text-xs font-f1-bold rounded hover:bg-neutral-700 transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowNewTaskForm(true);
                                }}
                                className="w-full mt-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs text-[#00D2BE] font-f1-bold rounded transition-colors flex items-center justify-center gap-1"
                              >
                                <Plus size={12} />
                                Assign New Task
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Intern View */
        <div className="space-y-4">
          <div>
            <h3 className="text-sm md:text-base font-f1-bold text-[#00D2BE] mb-3 flex items-center gap-2">
              <User size={16} />
              My Tasks
            </h3>
            {internViewIntern && (
              <>
                <div className="space-y-2 mb-4">
                  {internViewIntern.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-2 p-3 md:p-4 rounded-lg border border-neutral-800 bg-neutral-900/50 group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {task.status === "completed" ? (
                          <CheckCircle size={18} className="text-green-400" />
                        ) : task.status === "in-progress" ? (
                          <Clock size={18} className="text-[#00D2BE]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-neutral-600" />
                        )}
                        <span className="text-xs md:text-sm text-neutral-300 font-f1 flex-1">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleUpdateTaskStatus(
                              internViewIntern.id,
                              task.id,
                              e.target.value as Task["status"]
                            )
                          }
                          className="text-xs px-2 py-1 rounded font-f1-bold bg-neutral-800 border border-neutral-700 text-white focus:border-[#00D2BE] focus:outline-none cursor-pointer"
                        >
                          <option value="pending">pending</option>
                          <option value="in-progress">in-progress</option>
                          <option value="completed">completed</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(internViewIntern.id, task.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {showNewTaskForm ? (
                  <div className="p-3 bg-neutral-900 rounded border border-[#00D2BE]">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddTask(internViewIntern.id);
                        } else if (e.key === "Escape") {
                          setShowNewTaskForm(false);
                          setNewTaskTitle("");
                        }
                      }}
                      placeholder="Enter task title..."
                      autoFocus
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-xs md:text-sm text-white font-f1 focus:border-[#00D2BE] focus:outline-none mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddTask(internViewIntern.id)}
                        className="flex-1 px-3 py-2 bg-[#00D2BE] text-black text-xs md:text-sm font-f1-bold rounded hover:bg-[#00A896] transition-colors"
                      >
                        Add Task
                      </button>
                      <button
                        onClick={() => {
                          setShowNewTaskForm(false);
                          setNewTaskTitle("");
                        }}
                        className="px-3 py-2 bg-neutral-800 text-neutral-400 text-xs md:text-sm font-f1-bold rounded hover:bg-neutral-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewTaskForm(true)}
                    className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs md:text-sm text-[#00D2BE] font-f1-bold rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Create New Task
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

