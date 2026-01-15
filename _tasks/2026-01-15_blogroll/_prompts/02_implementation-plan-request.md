I want to add a markdown-based blogroll "database" to this repo.

Note: I specifically want to use markdown and frontmatter to store the data rather than Sanity CMS because I will accept pull requests from the community to update the data.

I want to eventually break this into its own repo and import it as a package so that the community doesn't do a pull request directly against my website repo but rather makes pull requests against a smaller, content-specific repo. Therefore, please structure this accordingly with the content cleanly separated from the rest of the app/website.

The loose phases we'll go through are as follows:

Phase 1. Research & Planning

A. Determine the tech solution (how we'll process the data and structure the database)
B. Design the specific data models
C. Create the robust implementation plan

Phase 2. Implement the Plan from Phase 1

Phase 3. Test, Fill with Content, Go Live

---

Now, please research on the web the most modern, robust, and effective libraries and approaches to creating a markdown-backed database of sorts. Here are the goals:

1. We will store several entities, essentially we're creating a normalized database. We'll have entities including these:

- Organization Name (e.g. website or source/organization name, separate entity)
- Creator/Author (an actual person record, separate entity)
- Resource (a specific tutorial, blog post, link to patreon or social media)
  Has a link to a creator and/or org name

Some relevant fields - Status (active or not) - Source Type - Primary Content Focus - URL

There's more detail about my data thus far here:
`_tasks/2026-01-15_blogroll/_resources/TouchDesigner-Resource-List-Development.md`

This is very much up in the air, and we will resolve the specifics next.

We determined the tech stack. See:
`_tasks/2026-01-15_blogroll/01_tech-stack.md`

We decided on the data model. See:
`_tasks/2026-01-15_blogroll/02_data-model.md`

Now, let's go over the initial UI needs.

- I want this to feel like a nice, easy-to-use and visually friendly filterable database.
- The page can be called "TouchDesigner Resources"
- I want standard abilities like table or grid views, filters, sorting.
- I like Tanstack Table. We can leave out virtualized rows for now.
- Thumbnail images for creators and resources will be optional, and initially NOT present. It will be a future step when we begin adding those. However, the code should be able to handle their presence with a graceful, minimal fallback. List views should for now not even attempt to show thumbnails.

Other changes:

1. Homepage: remove "things" and "looking". We will change the two options to "reading list" and "touch designer resources". The font can be smaller to fit the longer options.

2. Touch Designer resources can be a full-page showing the UI. We will eventually probably want to break it into sections and have the td resources page be more of an index, but for now I think we can just link directly to the resources db page. Let's put it at /touchdesigner/resources

3. Top nav, just show our two new homepage options, remove looking and things

Now, please read through the codebase and planning docs to get a complete and detailed understanding of the system. Ask any clarifying questions. Then, create a plan to achieve the goals using standard best practices and clean, maintainable, robust yet minimal, well-documented code following the established codebase patterns. Do not implement anything yet. Add the plan to `_tasks/2026-01-15_blogroll/03_implementation-plan.md`.
