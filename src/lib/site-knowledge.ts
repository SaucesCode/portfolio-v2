import { categoryLabels, caseStudies, getProject, projects, type Project } from '@/data/projects';
import { services } from '@/data/services';
import { site } from '@/data/site';
import { terms } from '@/data/terms';

/**
 * Everything the site says about James and his work, as plain text built from the same data as the
 * pages. Served as /llms.txt and used as the assistant's only source, so the two never drift.
 */

/** Homepage sections a visitor (or the assistant) can be taken to. */
export const sectionIds = ['featured', 'work', 'services', 'process', 'about', 'contact'] as const;
export type SectionId = (typeof sectionIds)[number];

export const projectSlugs = projects.map((project) => project.slug);

const describe = (project: Project) =>
  `${project.medium}, ${project.year}. ${project.summary} ${project.provenance}.${project.note ? ` ${project.note}` : ''}`;

export function siteKnowledge(baseUrl: string): string {
  const others = projects.filter((project) => !project.caseStudy);

  return `# ${site.name}

> ${site.name} is a ${site.role.toLowerCase()} based in the ${site.country}, designing and building custom web applications, business systems, APIs and databases, WordPress sites and themes, and websites, from data model to interface.

${site.availability}

Stack: Django and Node.js on the server, PostgreSQL for data, React and Next.js for interfaces, and PHP for WordPress block themes. The source code for each project is public on GitHub as ${site.githubHandle}. Each project below states where it comes from, such as a personal project or a concept build for a fictional brand.

## Services

${services
  .map((service) => {
    const examples = service.examples.map((slug) => getProject(slug).title).join(' and ');
    return `- ${service.name}: ${service.description} Examples: ${examples}.`;
  })
  .join('\n')}

## Working with me

${terms.map((term) => `- ${term.title}: ${term.body}`).join('\n')}

## Case studies

${caseStudies.map((project) => `- [${project.title}](${baseUrl}${project.caseStudy}): ${describe(project)}`).join('\n')}

## Other work

${others
  .map((project) => `- [${project.title}](${project.links[0].href}) (${categoryLabels[project.category]}): ${describe(project)}`)
  .join('\n')}

## Contact

- Website: ${baseUrl}/
- Email: ${site.email}
- GitHub: ${site.github}
- LinkedIn: ${site.linkedin}
`;
}
