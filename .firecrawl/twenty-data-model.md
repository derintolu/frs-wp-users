[Skip to main content](https://docs.twenty.com/user-guide/data-model/overview#content-area)

[Twenty Documentation home page![light logo](https://mintcdn.com/twenty/vG9yThgsV6f7S2k3/logo.svg?fit=max&auto=format&n=vG9yThgsV6f7S2k3&q=85&s=8c6cbd9599fa6e3dd24b6b737a4c8d49)![dark logo](https://mintcdn.com/twenty/vG9yThgsV6f7S2k3/logo.svg?fit=max&auto=format&n=vG9yThgsV6f7S2k3&q=85&s=8c6cbd9599fa6e3dd24b6b737a4c8d49)](https://docs.twenty.com/user-guide/introduction)

[User Guide](https://docs.twenty.com/user-guide/introduction) [Developers](https://docs.twenty.com/developers/introduction)

Search...

Navigation

Data Model

Data Model

Search...

Ctrl K

##### Discover Twenty

- [Discover Twenty](https://docs.twenty.com/user-guide/introduction)
- Capabilities

- How-Tos


##### Data Model

- [Data Model](https://docs.twenty.com/user-guide/data-model/overview)
- Capabilities

- How-Tos


##### Data Migration

- [Data Migration](https://docs.twenty.com/user-guide/data-migration/overview)
- Capabilities

- How-Tos


##### Calendar & Emails

- [Calendar & Emails](https://docs.twenty.com/user-guide/calendar-emails/overview)
- Capabilities

- How-Tos


##### Workflows

- [Workflows](https://docs.twenty.com/user-guide/workflows/overview)
- Capabilities

- How-Tos


##### AI

- [AI](https://docs.twenty.com/user-guide/ai/overview)
- Capabilities

- How-Tos


##### Views & Pipelines

- [Views & Pipelines](https://docs.twenty.com/user-guide/views-pipelines/overview)
- Capabilities

- How-Tos


##### Dashboards

- [Dashboards](https://docs.twenty.com/user-guide/dashboards/overview)
- Capabilities

- How-Tos


##### Permissions & Access

- [Permissions & Access](https://docs.twenty.com/user-guide/permissions-access/overview)
- Capabilities

- How-Tos


##### Billing

- [Billing](https://docs.twenty.com/user-guide/billing/overview)
- Capabilities

- How-Tos


##### Settings

- [Settings](https://docs.twenty.com/user-guide/settings/overview)
- Capabilities

- How-Tos


![US](https://d3gk2c5xim1je2.cloudfront.net/flags/US.svg)

English

On this page

- [What is a Data Model?](https://docs.twenty.com/user-guide/data-model/overview#what-is-a-data-model)
- [Key Concepts](https://docs.twenty.com/user-guide/data-model/overview#key-concepts)
- [Objects](https://docs.twenty.com/user-guide/data-model/overview#objects)
- [Fields](https://docs.twenty.com/user-guide/data-model/overview#fields)
- [Records](https://docs.twenty.com/user-guide/data-model/overview#records)
- [Why Customize Your Data Model?](https://docs.twenty.com/user-guide/data-model/overview#why-customize-your-data-model)
- [Tips to Design Your Data Model](https://docs.twenty.com/user-guide/data-model/overview#tips-to-design-your-data-model)
- [1\. Start with Your Core Objects](https://docs.twenty.com/user-guide/data-model/overview#1-start-with-your-core-objects)
- [2\. Use Fields for Variations, Not New Objects](https://docs.twenty.com/user-guide/data-model/overview#2-use-fields-for-variations-not-new-objects)
- [3\. Create an Object When It Stands on Its Own](https://docs.twenty.com/user-guide/data-model/overview#3-create-an-object-when-it-stands-on-its-own)
- [4\. Create an Object When Records Are Open-Ended](https://docs.twenty.com/user-guide/data-model/overview#4-create-an-object-when-records-are-open-ended)
- [5\. Keep It Simple First](https://docs.twenty.com/user-guide/data-model/overview#5-keep-it-simple-first)
- [Special Note on People, Companies, and Opportunities](https://docs.twenty.com/user-guide/data-model/overview#special-note-on-people-companies-and-opportunities)
- [Questions to Guide Your Choice](https://docs.twenty.com/user-guide/data-model/overview#questions-to-guide-your-choice)
- [Accessing Your Data Model](https://docs.twenty.com/user-guide/data-model/overview#accessing-your-data-model)
- [Next Steps](https://docs.twenty.com/user-guide/data-model/overview#next-steps)
- [Need Help?](https://docs.twenty.com/user-guide/data-model/overview#need-help)

![Data Model](https://mintcdn.com/twenty/JIRRbviz5phT8G2L/images/user-guide/fields/custom_data_model.png?fit=max&auto=format&n=JIRRbviz5phT8G2L&q=85&s=d388b2d2df49c3d5165026de2a87c4a9)

## [​](https://docs.twenty.com/user-guide/data-model/overview\#what-is-a-data-model)  What is a Data Model?

A data model is the structure that defines how information is organized in your CRM. Think of it as the **blueprint** of your customer data — you design it once, then fill it with your actual data.

## [​](https://docs.twenty.com/user-guide/data-model/overview\#key-concepts)  Key Concepts

### [​](https://docs.twenty.com/user-guide/data-model/overview\#objects)  Objects

**Objects** are the main categories of data in your CRM. Each object represents a type of thing you want to track.Twenty comes with standard objects:

- **People** — individuals (contacts, leads, partners)
- **Companies** — organizations
- **Opportunities** — deals or sales
- **Notes** — attached notes on records
- **Tasks** — to-dos linked to records

You can also create **custom objects** for anything specific to your business (e.g., Projects, Subscriptions, Events).

### [​](https://docs.twenty.com/user-guide/data-model/overview\#fields)  Fields

**Fields** are the properties or attributes that describe each object. They store the actual information.For example, the **People** object has fields like:

- Name
- Email
- Phone
- Job Title
- Company (a relation to the Companies object)

Fields have different **types**: text, number, date, select, multi-select, relation, and more. You can add custom fields to any object.

### [​](https://docs.twenty.com/user-guide/data-model/overview\#records)  Records

**Records** are the individual entries within an object — the actual data you create and manage.For example:

- “John Smith” is a **record** in the People object
- “Acme Corp” is a **record** in the Companies object

**An analogy:**

| Data Model Concept | Real-World Analogy |
| --- | --- |
| **Objects** | Sections in a book (the categories) |
| **Fields** | Columns in a spreadsheet (the properties) |
| **Records** | Rows in a spreadsheet (the actual entries) |

You design the data model (objects + fields) once, then create many records within that structure.

## [​](https://docs.twenty.com/user-guide/data-model/overview\#why-customize-your-data-model)  Why Customize Your Data Model?

Every business works differently. Customizing your data model means you can shape Twenty around **your** processes instead of forcing yours into a rigid system.Twenty offers full flexibility:

- Create as many custom objects as you need
- Add unlimited custom fields
- The price doesn’t change based on customization

## [​](https://docs.twenty.com/user-guide/data-model/overview\#tips-to-design-your-data-model)  Tips to Design Your Data Model

### [​](https://docs.twenty.com/user-guide/data-model/overview\#1-start-with-your-core-objects)  1\. Start with Your Core Objects

Identify the main concepts you work with. Twenty already provides:

- **People** — your contacts
- **Companies** — your accounts
- **Opportunities** — your deals

Think about what else you might need:

- Stripe would need a `Subscriptions` object
- Airbnb would need a `Trips` object
- An accelerator would need a `Batches` object

### [​](https://docs.twenty.com/user-guide/data-model/overview\#2-use-fields-for-variations-not-new-objects)  2\. Use Fields for Variations, Not New Objects

If something is just a characteristic of an existing object, make it a **field**.**Use fields for:**

- Categories and labels (e.g., `Industry` for Companies)
- Status values (e.g., `Stage` for Opportunities)
- Attributes and properties

### [​](https://docs.twenty.com/user-guide/data-model/overview\#3-create-an-object-when-it-stands-on-its-own)  3\. Create an Object When It Stands on Its Own

If the concept has its own lifecycle, properties, or relationships, it deserves an object.**Create an object for:**

- **Projects** — have deadlines, owners, and tasks
- **Subscriptions** — connect companies, products, and invoices
- **Events** — involve attendees and follow-up actions

These go beyond a single field because they carry their own data and relationships.

### [​](https://docs.twenty.com/user-guide/data-model/overview\#4-create-an-object-when-records-are-open-ended)  4\. Create an Object When Records Are Open-Ended

If something can be linked multiple times and you don’t know how many, use an object.**Bad approach:**
Creating fields like `Product 1`, `Product 2`, `Product 3`…**Good approach:**
Create a `Products` object and relate it to records. This supports one, two, or a hundred products without changing your model.

### [​](https://docs.twenty.com/user-guide/data-model/overview\#5-keep-it-simple-first)  5\. Keep It Simple First

Start with fields. Move to new objects only when you feel the limits:

- Too many fields on one object
- Repeated records that should be separate
- Relationships that don’t fit neatly

## [​](https://docs.twenty.com/user-guide/data-model/overview\#special-note-on-people-companies-and-opportunities)  Special Note on People, Companies, and Opportunities

**Email and calendar sync only works with People, Companies, and Opportunities.**These are the only objects where you can access synchronized emails and meetings from your mailbox/calendar. We recommend using them as much as possible.

**Best practices:**

- If you need categories of People, use fields (not new objects)
- Example: Use a `Person Type` field with values “Prospect” and “Partner” instead of creating separate objects
- Create different **views** to filter: one showing partners, another showing prospects

**It’s okay to have fields that don’t apply to every record.** For example, a `Referral Link` field on People that only applies when `Person Type = Partner`. Hide this field from views where it’s not relevant.

## [​](https://docs.twenty.com/user-guide/data-model/overview\#questions-to-guide-your-choice)  Questions to Guide Your Choice

Ask yourself:

Is this just a property of something I already have, or does it need its own properties?

Will I ever need to track multiple of these per record, without knowing how many?

Does this concept connect to several different objects, not just one?

Will it have its own lifecycle (stages, start/end dates)?

If the answer is “yes” to one or more, it’s probably time for a new object.

## [​](https://docs.twenty.com/user-guide/data-model/overview\#accessing-your-data-model)  Accessing Your Data Model

1. Go to **Settings** in the left sidebar
2. Click **Data Model**
3. View all your objects (standard and custom)
4. Click any object to see and edit its fields

**Don’t see Data Model in Settings?**Access to the data model is usually restricted to administrators. Contact your workspace admin if you need access.

## [​](https://docs.twenty.com/user-guide/data-model/overview\#next-steps)  Next Steps

Once you’ve planned your data model:

- [How to Create Custom Objects](https://docs.twenty.com/user-guide/data-model/how-tos/create-custom-objects)
- [How to Create Custom Fields](https://docs.twenty.com/user-guide/data-model/how-tos/create-custom-fields)
- [How to Create Relation Fields](https://docs.twenty.com/user-guide/data-model/how-tos/create-relation-fields)

## [​](https://docs.twenty.com/user-guide/data-model/overview\#need-help)  Need Help?

Our team can help you design and create the data model you need. Discover our [Implementation Services](https://docs.twenty.com/user-guide/getting-started/capabilities/implementation-services).

Was this page helpful?

YesNo

[Configure Your Workspace\\
\\
Previous](https://docs.twenty.com/user-guide/getting-started/how-tos/configure-your-workspace) [Objects\\
\\
Next](https://docs.twenty.com/user-guide/data-model/capabilities/objects)

Ctrl+I

Assistant

Responses are generated using AI and may contain mistakes.

![Data Model](https://mintcdn.com/twenty/JIRRbviz5phT8G2L/images/user-guide/fields/custom_data_model.png?w=840&fit=max&auto=format&n=JIRRbviz5phT8G2L&q=85&s=fe355a1c1a1ebe076cc5e3428af5b0b2)