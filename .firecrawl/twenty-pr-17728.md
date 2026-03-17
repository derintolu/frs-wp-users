[Skip to content](https://github.com/twentyhq/twenty/pull/17728#start-of-content)

You signed in with another tab or window. [Reload](https://github.com/twentyhq/twenty/pull/17728) to refresh your session.You signed out in another tab or window. [Reload](https://github.com/twentyhq/twenty/pull/17728) to refresh your session.You switched accounts on another tab or window. [Reload](https://github.com/twentyhq/twenty/pull/17728) to refresh your session.Dismiss alert

{{ message }}

[twentyhq](https://github.com/twentyhq)/ **[twenty](https://github.com/twentyhq/twenty)** Public

- [Notifications](https://github.com/login?return_to=%2Ftwentyhq%2Ftwenty) You must be signed in to change notification settings
- [Fork\\
5.4k](https://github.com/login?return_to=%2Ftwentyhq%2Ftwenty)
- [Star\\
40.5k](https://github.com/login?return_to=%2Ftwentyhq%2Ftwenty)


## Conversation

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=80&v=4)](https://github.com/abdulrahmancodes)


Copy link

Contributor

### ![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=48&v=4)**[abdulrahmancodes](https://github.com/abdulrahmancodes)**     commented   [on Feb 5Feb 5, 2026](https://github.com/twentyhq/twenty/pull/17728\#issue-3899693733)

_No description provided._

Sorry, something went wrong.


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

sentry\[bot\] reacted with hooray emoji

All reactions

- ![tada](https://github.githubassets.com/assets/1f389-36899a2cb781.png)1 reaction

[abdulrahmancodes](https://github.com/abdulrahmancodes)


added 30 commits
[last monthFebruary 2, 2026 07:33](https://github.com/twentyhq/twenty/pull/17728#commits-pushed-ad10e0a)

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Enhance navigation menu item components with icon color customization
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          ad10e0a
`

```
- Introduced `getNavigationMenuItemIconColors` utility to manage icon colors based on the theme.
- Updated `CurrentWorkspaceMemberNavigationMenuItems` and `NavigationDrawerItemForObjectMetadataItem` to utilize the new icon color utility.
- Refactored `NavigationMenuItemIcon` to include a styled background for icons, improving visual consistency.
- Adjusted `NavigationDrawerItem` and `NavigationDrawerSubItem` to accept and apply background colors for icons.

These changes improve the visual representation of navigation items and ensure consistent theming across the application.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Refactor NavigationMenuItemIcon to enhance icon color handling
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          8cbbc1b
`

```
- Added `IconColor` to the `useGetStandardObjectIcon` hook for improved icon color customization.
- Simplified logic for determining icon background color based on the presence of `targetRecordId` and `viewId`.
- Consolidated avatar rendering logic to reduce redundancy and improve readability.

These changes enhance the visual consistency and flexibility of navigation menu items.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Merge branch 'main' into feat/navbar-customization
`

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          2a5c2cf
`

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Add IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED feature flag
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          ef617aa
`

```
- Introduced the IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED flag across the GraphQL schema and server-side enums.
- Updated the workspace entity manager tests to include the new feature flag.
- Enhanced the seed feature flags utility to support the new flag.

These changes enable editing capabilities for navigation menu items, improving customization options.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Add navigation menu edit mode hooks and state management
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          986a36a
`

```
- Introduced `useNavigationMenuEditModeActions` for managing edit mode actions, including entering and canceling edit mode.
- Added `useNavigationMenuItemsDraftState` to handle draft state of navigation menu items, determining workspace items based on edit mode.
- Created `isNavigationMenuInEditModeState` and `navigationMenuItemsDraftState` atoms for managing edit mode status and draft items.

These additions enhance the functionality for editing navigation menu items, improving user experience and customization options.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Enhance Save and Cancel Buttons with Inverted Style Support
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          2affeaf
`

```
- Added an `inverted` prop to `CancelButton`, allowing for a tertiary button style.
- Updated `SaveButton` to support an `inverted` prop, changing its appearance based on the prop value.
- Modified `SaveAndCancelButtons` to pass the `inverted` prop to both buttons, ensuring consistent styling.

These changes improve the visual flexibility of the buttons in the settings module, enhancing user experience.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Add Navigation Menu Edit Mode Bar and Enhance Workspace Navigation Items
`

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          c8a7ce4
`

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Add Navigation Menu Item Edit Page and Update Command Menu Configuration
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          3672bb7
`

```
- Introduced `CommandMenuNavigationMenuItemEditPage` for editing navigation menu items.
- Updated `COMMAND_MENU_PAGES_CONFIG` to include the new edit page.
- Added state management for selected navigation menu item in edit mode.
- Enhanced `WorkspaceNavigationMenuItems` to support opening the edit page and handling edit mode interactions.

These changes improve the user experience by allowing direct editing of navigation menu items within the command menu.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Enhance Workspace Navigation Menu Items with Active Item Click Handling
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          e80574b
`

```
- Added support for handling active item clicks in the `WorkspaceNavigationMenuItems` component, allowing users to interact with items even when not in edit mode.
- Introduced a new styled container for right icons to improve layout and spacing.
- Updated `NavigationDrawerItemForObjectMetadataItem` and `NavigationDrawerSectionForObjectMetadataItems` components to accommodate the new click handling logic, enhancing user experience and interaction consistency.

These changes improve the functionality and usability of the navigation menu, making it more intuitive for users.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Refactor NavigationDrawerItemForObjectMetadataItem to Simplify Compon…
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          2d04977
`

```
…ent Structure

- Removed unused imports and state management related to views and context store, streamlining the component.
- Simplified the rendering logic by eliminating the collapsible container and directly rendering the `NavigationDrawerItem`.
- This refactor enhances readability and maintainability of the code while preserving existing functionality.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Merge branch 'main' into feat/navbar-customization
`

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          4224522
`

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Add Workflows Folder and Update Navigation Menu Structure
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          9e487f0
`

```
- Introduced a new 'workflowsFolder' item in the standard navigation menu, enhancing organization of workflow-related views.
- Added new entries for 'workflowsFolderAllWorkflows', 'workflowsFolderAllWorkflowRuns', and 'workflowsFolderAllWorkflowVersions' to improve navigation and access to workflow data.
- Created utility functions for generating flat metadata for folder items, streamlining the integration of new navigation items.
- Updated existing view and view field utilities to include support for workflow versions, ensuring comprehensive coverage in the navigation structure.

These changes enhance the user experience by providing a clearer and more structured navigation menu for workflows and their associated views.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Refactor Navigation Menu Item Structure and Introduce Workspace Secti…
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          9f9c766
`

```
…on Items

- Updated the navigation menu item components to utilize user-specific navigation items, enhancing the organization of workspace-related views.
- Introduced a new `WorkspaceNavigationMenuItemsFolder` component to manage folder items within the workspace navigation.
- Refactored hooks to separate workspace and user navigation items, improving data handling and clarity.
- Added utility functions to identify navigation menu item folders, streamlining the integration of folder items in the navigation structure.

These changes enhance the user experience by providing a more structured and intuitive navigation menu for workspace items.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Refactor Navigation Menu Item State Management and Update Component L…
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          b38039f
`

```
…ogic

- Replaced the `selectedWorkspaceObjectMetadataItemIdInEditModeState` with `selectedNavigationMenuItemInEditModeState` to streamline state management for navigation menu items.
- Updated components to utilize the new state, enhancing clarity and consistency across the navigation menu.
- Refactored hooks and component logic to improve handling of navigation menu item selection and editing, ensuring a more intuitive user experience.
- Introduced new utility functions and styled components to support the updated navigation structure.

These changes enhance the overall functionality and maintainability of the navigation menu system.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Update NavigationDrawerItem Width Calculation for Enhanced Layout
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          a65322d
`

```
- Adjusted the width calculation in the `NavigationDrawerItem` component to account for additional spacing when right options are present.
- Improved the responsiveness of the navigation drawer by refining the width logic for both expanded and collapsed states.

These changes enhance the visual consistency and usability of the navigation drawer items.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Enhance Command Menu Navigation Item Editing with Move and Remove Fun…
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          4611e83
`

```
…ctionality

- Introduced the ability to move navigation menu items up and down within the command menu, improving item organization.
- Added a remove option to delete selected navigation menu items, streamlining item management.
- Refactored the `CommandMenuNavigationMenuItemEditPage` component to utilize new hooks for item manipulation and state management.
- Updated related components and hooks to ensure consistent handling of navigation menu items.

These changes enhance the user experience by providing more control over navigation menu item arrangements and management.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Add New Sidebar Item Page to Command Menu and Update Navigation Struc…
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          3865922
`

```
…ture

- Introduced the `CommandMenuNewSidebarItemPage` component to facilitate the addition of new items to the navigation menu.
- Updated the `CommandMenuPagesConfig` to include the new sidebar item page, enhancing navigation options.
- Implemented hooks for adding objects and records to the navigation menu draft, improving item management.
- Refactored the `NavigationMenuEditModeBar` to support saving drafts and handling loading states, streamlining the editing process.

These changes enhance the command menu's functionality, providing users with more options for managing navigation items effectively.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Remove unused targetObjectMetadataId assignment in useSaveNavigationM…
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          df50bf4
`

```
…enuItemsDraft hook

- Eliminated the assignment of targetObjectMetadataId to undefined when viewId is defined, streamlining the input handling logic.
- This change improves the clarity and efficiency of the hook's functionality, ensuring only relevant data is processed.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Enhance Command Menu New Sidebar Item Page with System Object Support
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          9aaefbb
`

```
- Added support for system objects in the `CommandMenuNewSidebarItemPage`, allowing users to filter and select system-related items.
- Introduced new state management for system object search input and updated the back navigation logic for improved user experience.
- Refactored object metadata filtering to include system objects, enhancing the overall functionality of the command menu.
- Improved search functionality by implementing a dedicated search input for objects, streamlining the selection process.

These changes enhance the command menu's capabilities, providing users with more comprehensive options for managing navigation items.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Add View Support to Command Menu New Sidebar Item Page
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          f3f8a0c
`

```
- Integrated functionality for adding views to the navigation menu draft within the `CommandMenuNewSidebarItemPage`.
- Introduced a new hook, `useAddViewToNavigationMenuDraft`, to manage view additions effectively.
- Updated state management to accommodate view selection and search inputs, enhancing user interaction.
- Refactored related components and utilities to support view handling, improving overall command menu functionality.

These changes enhance the command menu's capabilities, allowing users to manage views alongside other navigation items seamlessly.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Enhance Command Menu List with Custom No Results Text
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          c89eee4
`

```
- Added a new `noResultsText` prop to the `CommandMenuList` component, allowing for customizable no results messages.
- Updated the `CommandMenuNewSidebarItemPage` to utilize the new prop, providing context-specific messages based on user input.
- Refactored the logic for displaying results to improve clarity and user experience when no views are found.

These changes enhance the flexibility of the command menu, improving user feedback during navigation item searches.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Enhance Back Navigation Logic in Command Menu New Sidebar Item Page
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          ff92bde
`

```
- Updated the back navigation logic in the `CommandMenuNewSidebarItemPage` to handle system object selections more effectively.
- Introduced a check for system object metadata to set the appropriate navigation option when returning to the view object list.
- Improved user experience by ensuring the correct state is maintained during navigation actions.

These changes enhance the functionality of the command menu, providing users with a more intuitive navigation experience when dealing with system objects.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Refactor Navigation Menu Item Draft Management and Enhance Command Me…
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          e2d4375
`

```
…nu Functionality

- Consolidated multiple hooks for adding items to the navigation menu draft into a single `useAddToNavigationMenuDraft` hook, streamlining the process for adding objects, views, and records.
- Removed outdated hooks `useAddObjectToNavigationMenuDraft`, `useAddViewToNavigationMenuDraft`, and refactored related components to utilize the new consolidated hook.
- Introduced `useUpdateNavigationMenuItemsDraft` hook to manage updates to navigation menu items in draft state, enhancing item editing capabilities.
- Enhanced the `CommandMenuNavigationMenuItemEditPage` with improved state management and additional functionality for object selection and navigation item manipulation.
- Updated the `useNavigationMenuItemMoveRemove` hook to include a new `moveToFolder` function, allowing for better organization of navigation items.

These changes improve the overall efficiency and usability of the command menu, providing users with a more cohesive experience when managing navigation items.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Enhance Command Menu Navigation Item Editing and Sorting Logic
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          70a338b
`

```
- Updated the `CommandMenuNavigationMenuItemEditPage` to handle empty folder states more gracefully, displaying a custom message when no folders are available.
- Refactored the logic for generating selectable item IDs to include a fallback for empty states.
- Improved the sorting logic in `sortNavigationMenuItems` to correctly handle index views and associated metadata, ensuring accurate display of labels and icons.
- Adjusted test cases to reflect changes in object naming conventions and ensure consistency in expected outcomes.

These changes improve the user experience by providing clearer feedback and more accurate representations of navigation items in the command menu.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Refactor Workspace Navigation Menu Item Rendering and Sorting Logic
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          b32d04b
`

```
- Updated the `WorkspaceNavigationMenuItemsFolder` component to conditionally render secondary labels based on the view key, improving clarity in navigation item representation.
- Simplified the logic in `sortNavigationMenuItems` to ensure consistent handling of object names, enhancing the accuracy of displayed labels.

These changes enhance the user experience by providing clearer navigation item details and improving the overall sorting logic.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Add Object Selection for View Editing in Command Menu
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          c516f95
`

```
- Introduced `CommandMenuSelectObjectForViewEditMenuItem` component to facilitate object selection for view editing.
- Enhanced state management in `CommandMenuNavigationMenuItemEditPage` to track selected object metadata for view editing.
- Updated logic to filter and sort objects based on their association with views, improving the user experience during object selection.
- Adjusted rendering logic to differentiate between object and view editing modes, ensuring clarity in user interactions.

These changes enhance the command menu's functionality, providing users with a more intuitive experience when managing object views.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Merge branch 'main' into feat/navbar-customization
`

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          2cf2ea6
`

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Enhance NavigationDrawerItem to include secondary label for object me…
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          5110c27
`

```
…tadata items

- Added a `secondaryLabel` prop to `NavigationDrawerItemForObjectMetadataItem` component.
- The `secondaryLabel` is conditionally set based on whether the item is a record or a view with a custom name, improving the clarity of displayed metadata.

This change enhances the user interface by providing additional context for object metadata items in the navigation drawer.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Integrate command menu functionality into NavigationMenuEditModeBar
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          41aa60d
`

```
- Added `useCommandMenu` hook to manage command menu interactions.
- Updated save draft logic to close the command menu upon successful save, enhancing user experience during navigation menu edits.

This change improves the responsiveness of the navigation menu editing process by ensuring the command menu closes automatically after saving changes.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Add CommandMenuFolderInfo component and integrate into CommandMenuPag…
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          fc592d3
`

```
…eInfo

- Introduced `CommandMenuFolderInfo` component to manage folder-specific interactions within the command menu.
- Updated `CommandMenuPageInfo` to conditionally render `CommandMenuFolderInfo` when editing a navigation menu item in folder mode.
- Enhanced folder management capabilities by adding folder creation and editing functionalities in the command menu.

These changes improve the user experience by providing a dedicated interface for folder management within the command menu, streamlining navigation and editing processes.
```

183 hidden items

Load more…


[abdulrahmancodes](https://github.com/abdulrahmancodes)


added 3 commits
[last monthFebruary 11, 2026 11:31](https://github.com/twentyhq/twenty/pull/17728#commits-pushed-698074e)

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          refactor: remove unused feature flag from seedFeatureFlags utility
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          698074e
`

```
Eliminated the IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED feature flag from the seedFeatureFlags utility, streamlining the code and removing redundancy.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          refactor: improve code readability in tests and components
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          1a7b1ab
`

```
- Enhanced the formatting of test cases in recordIdentifierToObjectRecordIdentifier, sortNavigationMenuItems, and validateAndExtractWorkspaceFolderId tests for better clarity.
- Added comments to the CommandMenuNewSidebarItemViewPickerSubView component to clarify prop spreading, improving maintainability and understanding of the code.
```

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          test: remove obsolete test files for navigation menu item utilities
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          7391b7b
`

```
Deleted outdated test files for getIconBackgroundColorForPayload, getNavigationMenuItemIconColors, and isWorkspaceDroppableId functions to streamline the test suite and eliminate redundancy. These tests are no longer necessary due to recent refactoring and updates in the utility functions.
```

[![Devessier](https://avatars.githubusercontent.com/u/29370468?s=60&v=4)](https://github.com/Devessier)

**[Devessier](https://github.com/Devessier)**

approved these changes

[on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728#pullrequestreview-3783702564)

[View reviewed changes](https://github.com/twentyhq/twenty/pull/17728/files)


Copy link

Contributor

### ![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=48&v=4)**[Devessier](https://github.com/Devessier)**     left a comment

There was a problem hiding this comment.

### Choose a reason for hiding this comment

The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).


Choose a reason
SpamAbuseOff TopicOutdatedDuplicateResolvedHide comment

Okay for me! Great job 👍

Sorry, something went wrong.


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

![+1](https://github.githubassets.com/assets/1f44d-41cb66fe1e22.png)1abdulrahmancodes reacted with thumbs up emoji

All reactions

- ![+1](https://github.githubassets.com/assets/1f44d-41cb66fe1e22.png)1 reaction

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&u=6a09ed693cc88ea157b21aef141c952e9d55de41&v=4)](https://github.com/abdulrahmancodes)[abdulrahmancodes](https://github.com/abdulrahmancodes)

enabled auto-merge

[last monthFebruary 11, 2026 10:51](https://github.com/twentyhq/twenty/pull/17728#event-22700109751)

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&u=6a09ed693cc88ea157b21aef141c952e9d55de41&v=4)](https://github.com/abdulrahmancodes)[abdulrahmancodes](https://github.com/abdulrahmancodes)

disabled auto-merge

[last monthFebruary 11, 2026 10:54](https://github.com/twentyhq/twenty/pull/17728#event-22700174517)

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&u=6a09ed693cc88ea157b21aef141c952e9d55de41&v=4)](https://github.com/abdulrahmancodes)[abdulrahmancodes](https://github.com/abdulrahmancodes) [force-pushed](https://github.com/twentyhq/twenty/compare/4d9b2d15e895778479a926645b03dd80a77e7bcb..7391b7b48bd3e951c6cc24545e9708fd9d588454)
the
feat/navbar-customization
branch
from
[`4d9b2d1`](https://github.com/twentyhq/twenty/commit/4d9b2d15e895778479a926645b03dd80a77e7bcb) to
[`7391b7b`](https://github.com/twentyhq/twenty/commit/7391b7b48bd3e951c6cc24545e9708fd9d588454) [Compare](https://github.com/twentyhq/twenty/compare/4d9b2d15e895778479a926645b03dd80a77e7bcb..7391b7b48bd3e951c6cc24545e9708fd9d588454) [last monthFebruary 11, 2026 11:08](https://github.com/twentyhq/twenty/pull/17728#event-22700505761)

[abdulrahmancodes](https://github.com/abdulrahmancodes) and others
added 4 commits
[last monthFebruary 11, 2026 16:47](https://github.com/twentyhq/twenty/pull/17728#commits-pushed-8a769fe)

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Merge branch 'main' into feat/navbar-customization
`

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          8a769fe
`

[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)

`
          Enhance GraphQL schema with new input types and enums
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          d8bb8e5
`

```
- Added new scalar type `Upload` to support file uploads.
- Introduced multiple input types for creating and managing various entities, including `ActivateWorkspaceInput`, `CreateAgentInput`, and `CreateApiKeyInput`.
- Expanded the schema with new enums such as `AllMetadataName` and `AnalyticsType` for better categorization of metadata and analytics events.
- Added new mutation inputs for workflow management, including `CreateWorkflowVersionEdgeInput` and `DeleteWorkflowVersionStepInput`.
- Implemented additional filtering capabilities with `DateTimeFilter` to enhance query flexibility.

These changes improve the overall functionality and usability of the GraphQL API, enabling more robust interactions with the backend.
```

[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=40&v=4)](https://github.com/Devessier)

`
          test: fix
`

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          56676a7
`

[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=40&v=4)](https://github.com/Devessier)

`
          chore: regenerate graphql
`

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          3e81789
`

[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=40&u=f82793c80d9ca3f90840fcd7ecafe76cb40f9eaf&v=4)](https://github.com/Devessier)[Devessier](https://github.com/Devessier)

added this pull request to the [merge queue](https://github.com/twentyhq/twenty/queue/main) [on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728#event-22703202308)

[![@github-merge-queue](https://avatars.githubusercontent.com/u/9919?s=40&v=4)](https://github.com/apps/github-merge-queue)[github-merge-queue](https://github.com/apps/github-merge-queue) bot

removed this pull request from the [merge queue](https://github.com/twentyhq/twenty/queue/main) due to failed status checks
[on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728#event-22703598420)

Hide detailsView details

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

[![@FelixMalfait](https://avatars.githubusercontent.com/u/6399865?s=40&u=e06ae86d6f8316cb0d92b1a531800a8e05824f42&v=4)](https://github.com/FelixMalfait)[FelixMalfait](https://github.com/FelixMalfait)

added this pull request to the [merge queue](https://github.com/twentyhq/twenty/queue/main) [on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728#event-22705020690)

[![@github-merge-queue](https://avatars.githubusercontent.com/u/9919?s=40&v=4)](https://github.com/apps/github-merge-queue)[github-merge-queue](https://github.com/apps/github-merge-queue) bot

removed this pull request from the [merge queue](https://github.com/twentyhq/twenty/queue/main) due to failed status checks
[on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728#event-22705428566)

Hide detailsView details

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=80&u=f82793c80d9ca3f90840fcd7ecafe76cb40f9eaf&v=4)](https://github.com/Devessier)


Copy link

Contributor

### **[Devessier](https://github.com/Devessier)**     commented   [on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728\#issuecomment-3884774929)

|     |
| --- |
| e2e tests don't pass. Checking why. |

![+1](https://github.githubassets.com/assets/1f44d-41cb66fe1e22.png)1abdulrahmancodes reacted with thumbs up emoji

All reactions

- ![+1](https://github.githubassets.com/assets/1f44d-41cb66fe1e22.png)1 reaction

Sorry, something went wrong.


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

[Devessier](https://github.com/Devessier)


added 2 commits
[last monthFebruary 11, 2026 15:37](https://github.com/twentyhq/twenty/pull/17728#commits-pushed-2d92857)

[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=40&v=4)](https://github.com/Devessier)

`
          Merge remote-tracking branch 'origin/main' into feat/navbar-customiza…
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          2d92857
`

```
…tion
```

[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=40&v=4)](https://github.com/Devessier)

`
          test: update e2e test according to new navigation system
`

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

`
          62abd18
`

[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=80&u=f82793c80d9ca3f90840fcd7ecafe76cb40f9eaf&v=4)](https://github.com/Devessier)


Copy link

Contributor

### **[Devessier](https://github.com/Devessier)**     commented   [on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728\#issuecomment-3885064624)

|     |
| --- |
| e2e tests should pass now |

All reactions

Sorry, something went wrong.


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=40&u=f82793c80d9ca3f90840fcd7ecafe76cb40f9eaf&v=4)](https://github.com/Devessier)[Devessier](https://github.com/Devessier)

enabled auto-merge

[last monthFebruary 11, 2026 15:12](https://github.com/twentyhq/twenty/pull/17728#event-22706936220)

[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=40&u=f82793c80d9ca3f90840fcd7ecafe76cb40f9eaf&v=4)](https://github.com/Devessier)[Devessier](https://github.com/Devessier)

added this pull request to the [merge queue](https://github.com/twentyhq/twenty/queue/main) [on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728#event-22707601376)

Hide detailsView details
Merged
via the queue into
main

with commit [`0902579`](https://github.com/twentyhq/twenty/commit/0902579fbe9e97707f8ffa30760a87040625d084) [on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728#event-22708261886)

99 of 101 checks passed


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=40&u=f82793c80d9ca3f90840fcd7ecafe76cb40f9eaf&v=4)](https://github.com/Devessier)[Devessier](https://github.com/Devessier)


deleted the

feat/navbar-customization

branch

[last monthFebruary 11, 2026 15:56](https://github.com/twentyhq/twenty/pull/17728#event-22708263146)

[![@twenty-eng-sync](https://avatars.githubusercontent.com/in/1196066?s=80&v=4)](https://github.com/apps/twenty-eng-sync)


Copy link

### **[twenty-eng-sync](https://github.com/apps/twenty-eng-sync) bot**     commented   [on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728\#issuecomment-3885359559)

|     |
| --- |
| Hey [@Devessier](https://github.com/Devessier)! After you've done the QA of your Pull Request, you can mark it as done [here](https://twenty-eng.twenty.com/object/pullRequest/bd4f93af-9be7-4260-a85a-3446a5151b7b). Thank you! |

All reactions

Sorry, something went wrong.


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

1 similar comment


[![@twenty-eng-sync](https://avatars.githubusercontent.com/in/1196066?s=80&v=4)](https://github.com/apps/twenty-eng-sync)


Copy link

### **[twenty-eng-sync](https://github.com/apps/twenty-eng-sync) bot**     commented   [on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728\#issuecomment-3885360278)

|     |
| --- |
| Hey [@Devessier](https://github.com/Devessier)! After you've done the QA of your Pull Request, you can mark it as done [here](https://twenty-eng.twenty.com/object/pullRequest/bd4f93af-9be7-4260-a85a-3446a5151b7b). Thank you! |

All reactions

Sorry, something went wrong.


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).

[![@github-actions](https://avatars.githubusercontent.com/in/15368?s=80&v=4)](https://github.com/apps/github-actions)


Copy link

Contributor

### **[github-actions](https://github.com/apps/github-actions) bot**     commented   [on Feb 11Feb 11, 2026](https://github.com/twentyhq/twenty/pull/17728\#issuecomment-3885364199)

| |  | Fails |
| --- | --- |
| 🚫 | `node` failed. |

### Log

Details

```
�[31mError: �[39m SyntaxError: Unexpected token 'C', "Contributo"... is not valid JSON\
    at JSON.parse (<anonymous>)\
�[90m    at parseJSONFromBytes (node:internal/deps/undici/undici:4259:19)�[39m\
�[90m    at successSteps (node:internal/deps/undici/undici:6882:27)�[39m\
�[90m    at readAllBytes (node:internal/deps/undici/undici:5807:13)�[39m\
�[90m    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)�[39m\
danger-results://tmp/danger-results-1bcafad9.json\
```\
\
Generated by 🚫 [dangerJS](https://danger.systems/js) against [`62abd18`](https://github.com/twentyhq/twenty/commit/62abd18542e945e49fb14495bbf4dad42a864a6e) |\
\
All reactions\
\
Sorry, something went wrong.\
\
\
### Uh oh!\
\
There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).\
\
[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&u=6a09ed693cc88ea157b21aef141c952e9d55de41&v=4)](https://github.com/abdulrahmancodes)[abdulrahmancodes](https://github.com/abdulrahmancodes)\
\
\
restored the\
\
feat/navbar-customization\
\
branch\
\
[last monthFebruary 12, 2026 01:42](https://github.com/twentyhq/twenty/pull/17728#event-22721185077)\
\
[github-merge-queue](https://github.com/apps/github-merge-queue) bot\
\
pushed a commit\
that referenced\
this pull request\
\
[on Feb 11Feb 12, 2026](https://github.com/twentyhq/twenty/pull/17728#ref-commit-3fb2352)\
\
[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&u=6a09ed693cc88ea157b21aef141c952e9d55de41&v=4)](https://github.com/abdulrahmancodes)[![@github-code-quality](https://avatars.githubusercontent.com/u/9919?s=40&v=4)](https://github.com/apps/github-code-quality)[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=40&u=f82793c80d9ca3f90840fcd7ecafe76cb40f9eaf&v=4)](https://github.com/Devessier)\
\
`\
          Navbar customization followup (#17848)\
`…\
\
Verified\
\
# Verified\
\
This commit was created on GitHub.com and signed with GitHub’s **verified signature**.\
\
\
GPG key ID: B5690EEEBB952194\
\
Verified\
on Feb 11, 2026, 09:35 PM\
\
[Learn about vigilant mode](https://docs.github.com/github/authenticating-to-github/displaying-verification-statuses-for-all-of-your-commits)\
\
Loading\
\
Loading status checks…\
\
### Uh oh!\
\
There was an error while loading. [Please reload this page](https://github.com/twentyhq/twenty/pull/17728).\
\
`\
          3fb2352\
`\
\
```\
Addresses review comments from the [first navbar customization\
PR](#17728)\
\
---------\
\
Co-authored-by: Copilot Autofix powered by AI <223894421+github-code-quality[bot]@users.noreply.github.com>\
Co-authored-by: Devessier <baptiste@devessier.fr>\
```\
\
[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&u=6a09ed693cc88ea157b21aef141c952e9d55de41&v=4)](https://github.com/abdulrahmancodes)[abdulrahmancodes](https://github.com/abdulrahmancodes)\
\
\
deleted the\
\
feat/navbar-customization\
\
branch\
\
[last monthFebruary 12, 2026 08:17](https://github.com/twentyhq/twenty/pull/17728#event-22727072904)\
\
This file contains hidden or bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.\
[Learn more about bidirectional Unicode characters](https://github.co/hiddenchars)\
\
[Show hidden characters](https://github.com/twentyhq/twenty/pull/17728)\
\
[Sign up for free](https://github.com/join?source=comment-repo) **to join this conversation on GitHub**.\
Already have an account?\
[Sign in to comment](https://github.com/login?return_to=https%3A%2F%2Fgithub.com%2Ftwentyhq%2Ftwenty%2Fpull%2F17728)\
\
### Reviewers\
\
[![@FelixMalfait](https://avatars.githubusercontent.com/u/6399865?s=40&v=4)](https://github.com/FelixMalfait)[FelixMalfait](https://github.com/FelixMalfait)FelixMalfait left review comments\
\
[![@sentry](https://avatars.githubusercontent.com/in/12637?s=40&v=4)](https://github.com/apps/sentry)[sentry\[bot\]](https://github.com/apps/sentry)sentry\[bot\] left review comments\
\
[![@cubic-dev-ai](https://avatars.githubusercontent.com/in/1082092?s=40&v=4)](https://github.com/apps/cubic-dev-ai)[cubic-dev-ai\[bot\]](https://github.com/apps/cubic-dev-ai)cubic-dev-ai\[bot\] left review comments\
\
[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=40&v=4)](https://github.com/Devessier)[Devessier](https://github.com/Devessier)Devessier approved these changes\
\
+1 more reviewer\
\
\
[![@github-code-quality](https://avatars.githubusercontent.com/u/9919?s=40&v=4)](https://github.com/apps/github-code-quality)[github-code-quality\[bot\]](https://github.com/apps/github-code-quality)github-code-quality\[bot\] left review comments\
\
Reviewers whose approvals may not affect merge requirements\
\
### Assignees\
\
[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=40&v=4)](https://github.com/abdulrahmancodes)[abdulrahmancodes](https://github.com/abdulrahmancodes)\
\
### Labels\
\
[-PR: awaiting author](https://github.com/twentyhq/twenty/issues?q=state%3Aopen%20label%3A%22-PR%3A%20awaiting%20author%22) [-PR: wip](https://github.com/twentyhq/twenty/issues?q=state%3Aopen%20label%3A%22-PR%3A%20wip%22)\
\
### Projects\
\
None yet\
\
### Milestone\
\
No milestone\
\
### Development\
\
Successfully merging this pull request may close these issues.\
\
None yet\
\
### 4 participants\
\
[![@abdulrahmancodes](https://avatars.githubusercontent.com/u/81605929?s=52&v=4)](https://github.com/abdulrahmancodes)[![@Devessier](https://avatars.githubusercontent.com/u/29370468?s=52&v=4)](https://github.com/Devessier)[![@FelixMalfait](https://avatars.githubusercontent.com/u/6399865?s=52&v=4)](https://github.com/FelixMalfait)[![@charlesBochet](https://avatars.githubusercontent.com/u/12035771?s=52&v=4)](https://github.com/charlesBochet)\
\
Add this suggestion to a batch that can be applied as a single commit.This suggestion is invalid because no changes were made to the code.Suggestions cannot be applied while the pull request is closed.Suggestions cannot be applied while viewing a subset of changes.Only one suggestion per line can be applied in a batch.Add this suggestion to a batch that can be applied as a single commit.Applying suggestions on deleted lines is not supported.You must change the existing code in this line in order to create a valid suggestion.Outdated suggestions cannot be applied.This suggestion has been applied or marked resolved.Suggestions cannot be applied from pending reviews.Suggestions cannot be applied on multi-line comments.Suggestions cannot be applied while the pull request is queued to merge.Suggestion cannot be applied right now. Please check back later.\
\
You can’t perform that action at this time.