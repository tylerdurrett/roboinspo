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

Now, based on `_tasks/2026-01-15_blogroll/_resources/TouchDesigner-Resource-List-Development.md` and my notes here, please propose a data model to cover the use cases. Ask clarifying questions as needed.
