# New Profile Editor Structure

## Layout Overview

```
SidebarProvider
├── ResizablePanelGroup (horizontal)
│   ├── ResizablePanel (sidebar - 30% default, 20-50% range)
│   │   └── ProfileEditorSidebar
│   │       ├── When activeSection === null: Show navigation menu
│   │       └── When activeSection !== null: Show forms with back button
│   ├── ResizableHandle (draggable divider)
│   └── ResizablePanel (preview - 70% default)
│       └── SidebarInset
│           ├── Header (Cancel/Save buttons)
│           └── Preview Content
```

## Components Needed

1. **ProfileEditorSidebar** ✅ Done
   - Shows navigation OR forms
   - Has back button when showing forms

2. **Main Structure** - Need to create
   - Fixed full-screen container
   - SidebarProvider wrapper
   - ResizablePanelGroup for horizontal split
   - Header with Cancel/Save in preview area

3. **Forms** - Need to extract
   - Profile form
   - Links & Social form
   - Service Areas form
   - Biography form
   - Specialties form
   - Certifications form

## Questions for User

1. Should forms have their own save button, or only the header save button?
2. Should preview update in real-time as user types?
3. What should initial state be - navigation menu or auto-open profile section?
