"use client"

import { useState } from "react"
import { CheckCircle2, Circle, AlertCircle } from "lucide-react"

interface ChecklistItem {
  id: string
  title: string
  description: string
  category: "security" | "performance" | "ux" | "data"
  completed: boolean
}

export function PreLaunchChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "security-1",
      title: "Secure Authentication",
      description: "Ensure all authentication mechanisms are secure and working properly",
      category: "security",
      completed: true,
    },
    {
      id: "security-2",
      title: "Data Encryption",
      description: "Verify that sensitive data is encrypted both in transit and at rest",
      category: "security",
      completed: true,
    },
    {
      id: "security-3",
      title: "Input Validation",
      description: "Validate all user inputs to prevent injection attacks",
      category: "security",
      completed: true,
    },
    {
      id: "performance-1",
      title: "Page Load Speed",
      description: "Ensure all pages load quickly (under 3 seconds)",
      category: "performance",
      completed: true,
    },
    {
      id: "performance-2",
      title: "Database Optimization",
      description: "Verify that database queries are optimized with proper indexes",
      category: "performance",
      completed: true,
    },
    {
      id: "ux-1",
      title: "Mobile Responsiveness",
      description: "Test the application on various mobile devices and screen sizes",
      category: "ux",
      completed: true,
    },
    {
      id: "ux-2",
      title: "Accessibility",
      description: "Ensure the application meets WCAG 2.1 AA standards",
      category: "ux",
      completed: false,
    },
    {
      id: "data-1",
      title: "Backup System",
      description: "Verify that automated backups are configured and working",
      category: "data",
      completed: false,
    },
    {
      id: "data-2",
      title: "Data Privacy",
      description: "Ensure compliance with relevant data privacy regulations",
      category: "data",
      completed: true,
    },
  ])

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const getCompletionStatus = () => {
    const total = items.length
    const completed = items.filter((item) => item.completed).length
    return {
      percentage: Math.round((completed / total) * 100),
      completed,
      total,
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Pre-Launch Checklist</h2>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${status.percentage}%` }}></div>
          </div>
          <span className="text-sm font-medium">{status.percentage}%</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {status.completed} of {status.total} items completed
        </p>
      </div>

      <div className="space-y-6">
        {["security", "performance", "ux", "data"].map((category) => (
          <div key={category} className="border-t pt-4">
            <h3 className="font-semibold text-lg capitalize mb-3">{category}</h3>
            <ul className="space-y-3">
              {items
                .filter((item) => item.category === category)
                .map((item) => (
                  <li key={item.id} className="flex items-start">
                    <button onClick={() => toggleItem(item.id)} className="mt-0.5 mr-2 flex-shrink-0 text-green-500">
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </button>
                    <div>
                      <p className={`font-medium ${item.completed ? "text-gray-500 line-through" : ""}`}>
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
          <div>
            <p className="font-medium">Ready for Deployment?</p>
            <p className="text-sm text-gray-500">
              {status.percentage === 100
                ? "All checklist items are complete! You're ready to deploy."
                : "Complete all checklist items before deploying to production."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
